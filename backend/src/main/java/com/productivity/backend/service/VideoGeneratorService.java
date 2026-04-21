package com.productivity.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.productivity.backend.dto.response.GeneratedVideoNoteResponse;
import com.productivity.backend.entity.study_notes_entity.Note;
import com.productivity.backend.entity.study_notes_entity.VideoNote;
import com.productivity.backend.repository.VideoNoteRepository;
import com.productivity.backend.repository.study_notes_repository.NoteRepository;
import com.productivity.backend.service.external.GitHubModelsService;
import com.productivity.backend.service.external.SerpApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Standalone video note generator:
 * 1. Accept YouTube URL
 * 2. Fetch transcript via SerpApi
 * 3. LLM generates note title + content from transcript
 * 4. LLM generates summary
 * 5. Persists Note + VideoNote and returns combined response
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VideoGeneratorService {

    private static final Pattern VIDEO_ID_PATTERN = Pattern
            .compile("(?:youtube\\.com/watch\\?v=|youtu\\.be/|youtube\\.com/embed/)([a-zA-Z0-9_-]{11})");

    private final NoteRepository noteRepository;
    private final VideoNoteRepository videoNoteRepository;
    private final SerpApiService serpApiService;
    private final GitHubModelsService githubModelsService;
    private final ObjectMapper objectMapper;

    @Transactional
    public GeneratedVideoNoteResponse generateFromUrl(String youtubeUrl) {
        String videoId = extractVideoId(youtubeUrl);

        // Fetch transcript
        String transcript = serpApiService.fetchTranscript(videoId);
        String truncated = transcript.length() > 6000 ? transcript.substring(0, 6000) + "..." : transcript;

        // LLM: generate title + content
        String noteTitle = "Video Note";
        String noteContent = truncated;
        try {
            String json = githubModelsService.generateNoteFromTranscript(truncated);
            Map<?, ?> parsed = objectMapper.readValue(json, Map.class);
            if (parsed.containsKey("title")) noteTitle = String.valueOf(parsed.get("title"));
            if (parsed.containsKey("content")) noteContent = String.valueOf(parsed.get("content"));
        } catch (Exception e) {
            log.warn("LLM note generation failed, using transcript as content: {}", e.getMessage());
        }

        // LLM: summary
        String summary = null;
        try {
            summary = githubModelsService.summarize(truncated);
        } catch (Exception e) {
            log.warn("LLM summarization failed: {}", e.getMessage());
        }

        // Persist Note
        Note note = new Note();
        note.setTitle(noteTitle);
        note.setContent(noteContent);
        note.setContentType("MARKDOWN");
        note.setIsPinned(false);
        note.setSummary(summary);
        Note savedNote = noteRepository.save(note);

        // Persist VideoNote
        VideoNote videoNote = new VideoNote();
        videoNote.setNote(savedNote);
        videoNote.setYoutubeUrl(youtubeUrl);
        videoNote.setVideoId(videoId);
        videoNote.setVideoTitle(noteTitle);
        videoNote.setTranscript(transcript);
        videoNote.setFetchedAt(LocalDateTime.now());
        VideoNote savedVideoNote = videoNoteRepository.save(videoNote);

        return new GeneratedVideoNoteResponse(
                savedNote.getId(),
                savedVideoNote.getId(),
                savedNote.getTitle(),
                savedNote.getContent(),
                summary,
                youtubeUrl,
                videoId,
                savedVideoNote.getVideoTitle(),
                transcript,
                savedNote.getCreatedAt()
        );
    }

    private String extractVideoId(String url) {
        Matcher matcher = VIDEO_ID_PATTERN.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        throw new IllegalArgumentException("Invalid YouTube URL: " + url);
    }
}

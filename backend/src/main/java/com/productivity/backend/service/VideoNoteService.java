package com.productivity.backend.service;

import com.productivity.backend.dto.request.VideoNoteRequest;
import com.productivity.backend.dto.response.VideoNoteResponse;
import com.productivity.backend.entity.study_notes_entity.Note;
import com.productivity.backend.entity.study_notes_entity.VideoNote;
import com.productivity.backend.exception.ResourceNotFoundException;
import com.productivity.backend.repository.study_notes_repository.NoteRepository;
import com.productivity.backend.repository.VideoNoteRepository;
import com.productivity.backend.service.external.GitHubModelsService;
import com.productivity.backend.service.external.SerpApiService;
import com.productivity.backend.service.study_notes_service.NoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoNoteService {

    private static final Pattern VIDEO_ID_PATTERN = Pattern
            .compile("(?:youtube\\.com/watch\\?v=|youtu\\.be/|youtube\\.com/embed/)([a-zA-Z0-9_-]{11})");

    private final VideoNoteRepository videoNoteRepository;
    private final NoteRepository noteRepository;
    private final NoteService noteService;
    private final SerpApiService serpApiService;
    private final GitHubModelsService githubModelsService;

    /**
     * Intelligent workflow:
     * 1. Fetch transcript from YouTube
     * 2. Save transcript to note content
     * 3. Process with LLM for summary and key points
     * 4. Generate flashcards using LLM
     * 5. Return enriched response with all processed data
     */
    @Transactional
    public VideoNoteResponse attach(Long noteId, VideoNoteRequest request) {
        Note note = noteService.getOwnedNote(noteId);
        String videoId = extractVideoId(request.getYoutubeUrl());

        // Delete existing video note if present to avoid unique constraint violation
        videoNoteRepository.deleteByNoteId(noteId);

        // Create new video note
        VideoNote videoNote = new VideoNote();
        videoNote.setNote(note);
        videoNote.setYoutubeUrl(request.getYoutubeUrl());
        videoNote.setVideoId(videoId);
        videoNote.setVideoTitle(request.getVideoTitle());
        videoNote.setFetchedAt(LocalDateTime.now());

        // Step 1: Fetch transcript
        String transcript = null;
        try {
            transcript = serpApiService.fetchTranscript(videoId);
            videoNote.setTranscript(transcript);
            log.info("Successfully fetched transcript for video {}", videoId);
        } catch (Exception e) {
            log.warn("Failed to fetch transcript for video {}: {}", videoId, e.getMessage());
            videoNote.setTranscript(null);
        }

        // Save video note
        VideoNote savedVideoNote = videoNoteRepository.save(videoNote);

        // Step 2: If transcript exists, process with LLM
        String summary = null;
        String flashcardsJson = null;

        if (transcript != null && !transcript.isBlank()) {
            try {
                // Save transcript to note content
                note.setContent(transcript);
                log.debug("Saved transcript to note content");

                // Step 3: Process transcript with LLM - generate summary and key points
                summary = processTranscriptWithLLM(transcript);
                note.setSummary(summary);
                log.info("Generated summary for note {}", noteId);

                // Step 4: Generate flashcards from transcript
                flashcardsJson = generateFlashcardsFromTranscript(transcript);
                log.info("Generated flashcards for note {}", noteId);

                // Save note with updated content and summary
                noteRepository.save(note);
                log.info("Successfully processed and saved video note for note {}", noteId);

            } catch (Exception e) {
                log.warn("Failed to process transcript with LLM for note {}: {}", noteId, e.getMessage());
                // Continue even if LLM processing fails
            }
        }

        // Step 5: Return enriched response with transcript, summary, and flashcards
        return VideoNoteResponse.from(savedVideoNote, summary, flashcardsJson);
    }

    public VideoNoteResponse get(Long noteId) {
        noteService.getOwnedNote(noteId);
        VideoNote videoNote = videoNoteRepository.findByNoteId(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("No video attached to this note"));
        return VideoNoteResponse.from(videoNote);
    }

    @Transactional
    public void remove(Long noteId) {
        Note note = noteService.getOwnedNote(noteId);
        VideoNote videoNote = videoNoteRepository.findByNoteId(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("No video attached to this note"));

        // Keep the in-memory one-to-one association in sync before removing the child entity.
        note.setVideoNote(null);
        videoNoteRepository.delete(videoNote);
    }

    /**
     * Refresh transcript and reprocess with LLM
     */
    @Transactional
    public VideoNoteResponse refreshTranscript(Long noteId) {
        Note note = noteService.getOwnedNote(noteId);
        VideoNote videoNote = videoNoteRepository.findByNoteId(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("No video attached to this note"));

        // Step 1: Fetch fresh transcript
        try {
            String newTranscript = serpApiService.fetchTranscript(videoNote.getVideoId());
            videoNote.setTranscript(newTranscript);
            log.info("Successfully refreshed transcript for note {}", noteId);
        } catch (Exception e) {
            log.warn("Failed to refresh transcript: {}", e.getMessage());
        }

        videoNote.setFetchedAt(LocalDateTime.now());
        VideoNote savedVideoNote = videoNoteRepository.save(videoNote);

        // Step 2: Reprocess with LLM if transcript exists
        String summary = null;
        String flashcardsJson = null;

        if (savedVideoNote.getTranscript() != null && !savedVideoNote.getTranscript().isBlank()) {
            try {
                // Update note with fresh transcript
                note.setContent(savedVideoNote.getTranscript());

                // Generate fresh summary
                summary = processTranscriptWithLLM(savedVideoNote.getTranscript());
                note.setSummary(summary);

                // Generate fresh flashcards
                flashcardsJson = generateFlashcardsFromTranscript(savedVideoNote.getTranscript());

                noteRepository.save(note);
                log.info("Successfully reprocessed transcript for note {}", noteId);
            } catch (Exception e) {
                log.warn("Failed to reprocess transcript with LLM: {}", e.getMessage());
            }
        }

        return VideoNoteResponse.from(savedVideoNote, summary, flashcardsJson);
    }

    private String extractVideoId(String url) {
        Matcher matcher = VIDEO_ID_PATTERN.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        throw new IllegalArgumentException("Invalid YouTube URL: " + url);
    }

    /**
     * Process transcript with LLM to extract key points and create summary
     */
    private String processTranscriptWithLLM(String transcript) {
        // Truncate long transcripts to avoid token limits (first 4000 chars)
        String truncatedTranscript = transcript.length() > 4000
                ? transcript.substring(0, 4000) + "..."
                : transcript;

        try {
            return githubModelsService.summarize(truncatedTranscript);
        } catch (Exception e) {
            log.warn("LLMProcessing failed for transcript summary: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Generate flashcards from transcript using LLM
     */
    private String generateFlashcardsFromTranscript(String transcript) {
        // Truncate long transcripts to avoid token limits (first 4000 chars)
        String truncatedTranscript = transcript.length() > 4000
                ? transcript.substring(0, 4000) + "..."
                : transcript;

        try {
            return githubModelsService.generateFlashcardsJson(truncatedTranscript);
        } catch (Exception e) {
            log.warn("LLM flashcard generation failed: {}", e.getMessage());
            throw e;
        }
    }
}

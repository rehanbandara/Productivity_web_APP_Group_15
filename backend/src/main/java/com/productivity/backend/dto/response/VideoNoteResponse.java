package com.productivity.backend.dto.response;

import com.productivity.backend.entity.study_notes_entity.VideoNote;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoNoteResponse {
    private Long id;
    private Long noteId;
    private String youtubeUrl;
    private String videoId;
    private String videoTitle;
    private String transcript;
    private String summary; // LLM-generated summary and key points
    private String flashcardsJson; // LLM-generated flashcards in JSON format
    private LocalDateTime fetchedAt;

    public static VideoNoteResponse from(VideoNote videoNote) {
        return new VideoNoteResponse(
                videoNote.getId(),
                videoNote.getNote().getId(),
                videoNote.getYoutubeUrl(),
                videoNote.getVideoId(),
                videoNote.getVideoTitle(),
                videoNote.getTranscript(),
                null, // summary will be set separately
                null, // flashcardsJson will be set separately
                videoNote.getFetchedAt());
    }

    public static VideoNoteResponse from(VideoNote videoNote, String summary, String flashcardsJson) {
        VideoNoteResponse response = from(videoNote);
        response.setSummary(summary);
        response.setFlashcardsJson(flashcardsJson);
        return response;
    }
}

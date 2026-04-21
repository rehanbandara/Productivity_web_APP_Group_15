package com.productivity.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedVideoNoteResponse {
    private Long noteId;
    private Long videoNoteId;
    private String noteTitle;
    private String noteContent;
    private String summary;
    private String youtubeUrl;
    private String videoId;
    private String videoTitle;
    private String transcript;
    private LocalDateTime createdAt;
}

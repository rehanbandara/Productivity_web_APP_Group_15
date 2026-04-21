package com.productivity.backend.dto.response;

import com.productivity.backend.entity.study_notes_entity.Note;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponse {
    private Long id;
    private String title;
    private String content;
    private String contentType;
    private String summary;
    private Boolean isPinned;
    private TopicResponse topic;
    private Set<TagResponse> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoteResponse from(Note note) {
        return new NoteResponse(
                note.getId(),
                note.getTitle(),
                note.getContent(),
                note.getContentType(),
                note.getSummary(),
                note.getIsPinned(),
                note.getTopic() != null ? TopicResponse.from(note.getTopic()) : null,
                note.getTags().stream().map(TagResponse::from).collect(Collectors.toSet()),
                note.getCreatedAt(),
                note.getUpdatedAt()
        );
    }
}

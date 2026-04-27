package com.productivity.backend.dto.response;

import com.productivity.backend.entity.study_notes_entity.Topic;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponse {
    private Long id;
    private String name;
    private String color;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TopicResponse from(Topic topic) {
        return new TopicResponse(
                topic.getId(),
                topic.getName(),
                topic.getColor(),
                topic.getDescription(),
                topic.getCreatedAt(),
                topic.getUpdatedAt()
        );
    }
}

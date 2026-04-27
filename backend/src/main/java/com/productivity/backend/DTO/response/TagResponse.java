package com.productivity.backend.dto.response;

import com.productivity.backend.entity.study_notes_entity.Tag;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TagResponse {
    private Long id;
    private String name;
    private String color;
    private LocalDateTime createdAt;

    public static TagResponse from(Tag tag) {
        return new TagResponse(
                tag.getId(),
                tag.getName(),
                tag.getColor(),
                tag.getCreatedAt()
        );
    }
}

package com.productivity.backend.entity.study_notes_entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    private Note note;

    @Column(nullable = false, length = 500)
    private String youtubeUrl;

    @Column(nullable = false, length = 20)
    private String videoId;

    @Column(length = 255)
    private String videoTitle;

    @Column(columnDefinition = "LONGTEXT")
    private String transcript;

    private LocalDateTime fetchedAt;
}

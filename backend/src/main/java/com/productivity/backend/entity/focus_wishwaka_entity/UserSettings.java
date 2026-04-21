package com.productivity.backend.entity.focus_wishwaka_entity;

import com.productivity.backend.entity.user_entity.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Embedded
    private FocusSettings focus = new FocusSettings();
    
    @Embedded
    private WellnessSettings wellness = new WellnessSettings();
    
    @Embedded
    private NotificationSettings notifications = new NotificationSettings();
    
    @Embedded
    private GeneralSettings general = new GeneralSettings();
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FocusSettings {
        @Column(name = "work_duration")
        private Integer workDuration = 25;
        
        @Column(name = "short_break_duration")
        private Integer shortBreakDuration = 5;
        
        @Column(name = "long_break_duration")
        private Integer longBreakDuration = 15;
        
        @Column(name = "sessions_until_long_break")
        private Integer sessionsUntilLongBreak = 4;
        
        @Column(name = "auto_start_breaks")
        private Boolean autoStartBreaks = false;
        
        @Column(name = "auto_start_work")
        private Boolean autoStartWork = false;
        
        @Column(name = "sound_enabled")
        private Boolean soundEnabled = true;
        
        private Double volume = 0.5;
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WellnessSettings {
        @Embedded
        private EyeRestSettings eyeRest = new EyeRestSettings();
        
        @Embedded
        private PostureSettings posture = new PostureSettings();
        
        @Embedded
        private BreakSettings breakSettings = new BreakSettings();
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EyeRestSettings {
        @Column(name = "eye_rest_enabled")
        private Boolean enabled = true;
        @Column(name = "eye_rest_interval")
        private Integer interval = 20;
        @Column(name = "eye_rest_duration")
        private Integer duration = 20;
        @Column(name = "eye_rest_sound_enabled")
        private Boolean soundEnabled = true;
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostureSettings {
        @Column(name = "posture_enabled")
        private Boolean enabled = true;
        @Column(name = "posture_interval")
        private Integer interval = 45;
        @Column(name = "posture_duration")
        private Integer duration = 15;
        @Column(name = "posture_sound_enabled")
        private Boolean soundEnabled = true;
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BreakSettings {
        @Column(name = "break_enabled")
        private Boolean enabled = true;
        @Column(name = "break_interval")
        private Integer interval = 25;
        @Column(name = "break_duration")
        private Integer duration = 300;
        @Column(name = "break_sound_enabled")
        private Boolean soundEnabled = true;
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationSettings {
        private Boolean desktop = true;
        private Boolean sound = true;
        private Boolean email = false;
        private Boolean push = false;
        @Column(name = "reminder_lead_time")
        private Integer reminderLeadTime = 5;
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneralSettings {
        private String theme = "light";
        private String language = "en";
        private String timezone = "UTC";
        @Column(name = "date_format")
        private String dateFormat = "MM/DD/YYYY";
        @Column(name = "time_format")
        private String timeFormat = "12h";
    }
}

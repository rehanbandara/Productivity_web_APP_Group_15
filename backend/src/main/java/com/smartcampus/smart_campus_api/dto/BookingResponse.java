package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.BookingStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;


@Data
@Builder
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userName;    
    private String userEmail;    
    private Long resourceId;
    private String resourceName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String adminRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
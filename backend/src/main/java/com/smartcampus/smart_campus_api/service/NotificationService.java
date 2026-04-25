package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.CreateNotificationDTO;
import com.smartcampus.smart_campus_api.dto.NotificationResponseDTO;
import java.util.List;

public interface NotificationService {

    NotificationResponseDTO createNotification(CreateNotificationDTO dto);
    List<NotificationResponseDTO> getAllNotifications(Long userId);
    List<NotificationResponseDTO> getUnreadNotifications(Long userId);

    long getUnreadCount(Long userId);

    NotificationResponseDTO markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);
    void deleteNotification(Long notificationId, Long userId);
}
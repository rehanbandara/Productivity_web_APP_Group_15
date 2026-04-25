package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.NotificationPreferenceDTO;
import com.smartcampus.smart_campus_api.model.NotificationType;
import java.util.Set;

public interface NotificationPreferenceService {

    NotificationPreferenceDTO getPreferences(Long userId);

    NotificationPreferenceDTO updatePreferences(Long userId, Set<NotificationType> enabledTypes);

    boolean isTypeEnabled(Long userId, NotificationType type);
}
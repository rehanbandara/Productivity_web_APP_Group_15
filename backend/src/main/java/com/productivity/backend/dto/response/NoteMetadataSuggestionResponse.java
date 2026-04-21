package com.productivity.backend.dto.response;

import java.util.List;

public record NoteMetadataSuggestionResponse(String topicName, List<String> tags) {}

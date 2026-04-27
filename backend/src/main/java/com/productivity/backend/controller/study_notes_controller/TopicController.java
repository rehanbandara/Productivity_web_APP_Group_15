package com.productivity.backend.controller.study_notes_controller;

import com.productivity.backend.service.study_notes_service.TopicService;
import com.productivity.backend.dto.request.TopicRequest;
import com.productivity.backend.dto.response.TopicResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    @GetMapping
    public ResponseEntity<List<TopicResponse>> getAllTopics() {
        List<TopicResponse> topics = topicService.getAll();
        return ResponseEntity.ok(topics);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicResponse> getTopicById(@PathVariable Long id) {
        TopicResponse topic = topicService.getById(id);
        return ResponseEntity.ok(topic);
    }

    @PostMapping
    public ResponseEntity<TopicResponse> createTopic(@Valid @RequestBody TopicRequest request) {
        TopicResponse topic = topicService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(topic);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TopicResponse> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody TopicRequest request) {
        TopicResponse topic = topicService.update(id, request);
        return ResponseEntity.ok(topic);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

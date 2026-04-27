package com.productivity.backend.service.study_notes_service;

import com.productivity.backend.entity.study_notes_entity.Topic;
import com.productivity.backend.repository.study_notes_repository.TopicRepository;
import com.productivity.backend.dto.request.TopicRequest;
import com.productivity.backend.dto.response.TopicResponse;
import com.productivity.backend.exception.BadRequestException;
import com.productivity.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;

    public List<TopicResponse> getAll() {
        return topicRepository.findAll().stream().map(TopicResponse::from).toList();
    }

    public TopicResponse getById(Long id) {
        Topic topic = topicRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        return TopicResponse.from(topic);
    }

    public TopicResponse create(TopicRequest request) {
        if (topicRepository.existsByName(request.getName())) {
            throw new BadRequestException("Topic with name '" + request.getName() + "' already exists");
        }

        Topic topic = new Topic();
        topic.setName(request.getName());
        topic.setColor(request.getColor());
        topic.setDescription(request.getDescription());

        return TopicResponse.from(topicRepository.save(topic));
    }

    public TopicResponse update(Long id, TopicRequest request) {
        Topic topic = topicRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        if (!topic.getName().equals(request.getName()) && topicRepository.existsByName(request.getName())) {
            throw new BadRequestException("Topic with name '" + request.getName() + "' already exists");
        }

        topic.setName(request.getName());
        topic.setColor(request.getColor());
        topic.setDescription(request.getDescription());

        return TopicResponse.from(topicRepository.save(topic));
    }

    public void delete(Long id) {
        if (!topicRepository.existsById(id)) {
            throw new ResourceNotFoundException("Topic not found");
        }
        topicRepository.deleteById(id);
    }
}

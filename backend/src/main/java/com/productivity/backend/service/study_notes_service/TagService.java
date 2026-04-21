package com.productivity.backend.service.study_notes_service;

import com.productivity.backend.entity.study_notes_entity.Tag;
import com.productivity.backend.repository.study_notes_repository.TagRepository;
import com.productivity.backend.dto.request.TagRequest;
import com.productivity.backend.dto.response.TagResponse;
import com.productivity.backend.exception.BadRequestException;
import com.productivity.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public List<TagResponse> getAll() {
        return tagRepository.findAll().stream().map(TagResponse::from).toList();
    }

    public TagResponse getById(Long id) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        return TagResponse.from(tag);
    }

    public TagResponse create(TagRequest request) {
        if (tagRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tag with name '" + request.getName() + "' already exists");
        }

        Tag tag = new Tag();
        tag.setName(request.getName());
        tag.setColor(request.getColor());

        return TagResponse.from(tagRepository.save(tag));
    }

    public TagResponse update(Long id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));

        if (!tag.getName().equals(request.getName()) && tagRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tag with name '" + request.getName() + "' already exists");
        }

        tag.setName(request.getName());
        tag.setColor(request.getColor());

        return TagResponse.from(tagRepository.save(tag));
    }

    public void delete(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tag not found");
        }
        tagRepository.deleteById(id);
    }
}

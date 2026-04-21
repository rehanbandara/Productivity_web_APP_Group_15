package com.productivity.backend.service.study_notes_service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.productivity.backend.dto.request.NoteRequest;
import com.productivity.backend.dto.request.AutoSaveRequest;
import com.productivity.backend.dto.response.NoteMetadataSuggestionResponse;
import com.productivity.backend.dto.response.NoteResponse;
import com.productivity.backend.entity.study_notes_entity.Note;
import com.productivity.backend.entity.study_notes_entity.Tag;
import com.productivity.backend.entity.study_notes_entity.Topic;
import com.productivity.backend.exception.BadRequestException;
import com.productivity.backend.exception.ResourceNotFoundException;
import com.productivity.backend.repository.study_notes_repository.NoteRepository;
import com.productivity.backend.repository.study_notes_repository.TagRepository;
import com.productivity.backend.repository.study_notes_repository.TopicRepository;
import com.productivity.backend.service.external.GitHubModelsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final TopicRepository topicRepository;
    private final TagRepository tagRepository;
    private final GitHubModelsService gitHubModelsService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<NoteResponse> getAll(Long topicId, Long tagId, String search) {
        List<Note> notes;

        if (search != null && !search.isEmpty()) {
            notes = noteRepository.searchByKeyword(search);
        } else if (tagId != null) {
            notes = noteRepository.findAllByTagId(tagId);
        } else if (topicId != null) {
            notes = noteRepository.findAllByTopicIdOrderByIsPinnedDescUpdatedAtDesc(topicId);
        } else {
            notes = noteRepository.findAllByOrderByIsPinnedDescUpdatedAtDesc();
        }

        return notes.stream().map(NoteResponse::from).toList();
    }

    public NoteResponse getById(Long id) {
        return NoteResponse.from(getOwnedNote(id));
    }

    public NoteResponse create(NoteRequest request) {
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setContentType(request.getContentType() != null ? request.getContentType() : "MARKDOWN");
        note.setIsPinned(Boolean.FALSE);

        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
            note.setTopic(topic);
        }

        return NoteResponse.from(noteRepository.save(note));
    }

    public NoteResponse update(Long id, NoteRequest request) {
        Note note = getOwnedNote(id);

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setContentType(request.getContentType() != null ? request.getContentType() : "MARKDOWN");

        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
            note.setTopic(topic);
        } else {
            note.setTopic(null);
        }

        return NoteResponse.from(noteRepository.save(note));
    }

    public NoteResponse autoSave(Long id, AutoSaveRequest request) {
        Note note = getOwnedNote(id);
        note.setContent(request.getContent());
        return NoteResponse.from(noteRepository.save(note));
    }

    public void delete(Long id) {
        noteRepository.delete(getOwnedNote(id));
    }

    public NoteResponse togglePin(Long id) {
        Note note = getOwnedNote(id);
        note.setIsPinned(!Boolean.TRUE.equals(note.getIsPinned()));
        return NoteResponse.from(noteRepository.save(note));
    }

    @Transactional
    public NoteResponse attachTag(Long noteId, Long tagId) {
        Note note = getOwnedNote(noteId);
        Tag tag = tagRepository.findById(tagId)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));

        if (note.getTags().stream().anyMatch(existingTag -> existingTag.getId().equals(tagId))) {
            throw new BadRequestException("Tag already attached to this note");
        }
        note.getTags().add(tag);
        return NoteResponse.from(noteRepository.save(note));
    }

    @Transactional
    public NoteResponse removeTag(Long noteId, Long tagId) {
        Note note = getOwnedNote(noteId);
        boolean removed = note.getTags().removeIf(tag -> tag.getId().equals(tagId));
        if (!removed) {
            throw new ResourceNotFoundException("Tag not attached to this note");
        }
        return NoteResponse.from(noteRepository.save(note));
    }

    public NoteMetadataSuggestionResponse suggestMetadata(String title, String content) {
        try {
            String json = gitHubModelsService.generateMetadataJson(title, content);
            JsonNode node = objectMapper.readTree(json);
            String topicName = node.path("topicName").asText("");
            List<String> tags = new ArrayList<>();
            JsonNode tagsNode = node.path("tags");
            if (tagsNode.isArray()) {
                tagsNode.forEach(t -> tags.add(t.asText()));
            }
            return new NoteMetadataSuggestionResponse(topicName, tags);
        } catch (Exception e) {
            return new NoteMetadataSuggestionResponse("", List.of());
        }
    }

    public Note getOwnedNote(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
    }
}

package com.productivity.backend.service;

import com.productivity.backend.entity.study_notes_entity.Note;
import com.productivity.backend.entity.study_notes_entity.VideoNote;
import com.productivity.backend.exception.ResourceNotFoundException;
import com.productivity.backend.repository.VideoNoteRepository;
import com.productivity.backend.repository.study_notes_repository.NoteRepository;
import com.productivity.backend.service.external.GitHubModelsService;
import com.productivity.backend.service.external.SerpApiService;
import com.productivity.backend.service.study_notes_service.NoteService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VideoNoteServiceTest {

    @Mock
    private VideoNoteRepository videoNoteRepository;

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private NoteService noteService;

    @Mock
    private SerpApiService serpApiService;

    @Mock
    private GitHubModelsService githubModelsService;

    @InjectMocks
    private VideoNoteService videoNoteService;

    @Test
    void removeClearsAssociationAndDeletesVideoNoteEntity() {
        Note note = new Note();
        note.setId(10L);

        VideoNote videoNote = new VideoNote();
        videoNote.setId(20L);
        videoNote.setNote(note);
        note.setVideoNote(videoNote);

        when(noteService.getOwnedNote(10L)).thenReturn(note);
        when(videoNoteRepository.findByNoteId(10L)).thenReturn(Optional.of(videoNote));

        videoNoteService.remove(10L);

        assertThat(note.getVideoNote()).isNull();
        verify(videoNoteRepository).delete(videoNote);
    }

    @Test
    void removeThrowsWhenVideoNoteDoesNotExist() {
        Note note = new Note();
        note.setId(10L);

        when(noteService.getOwnedNote(10L)).thenReturn(note);
        when(videoNoteRepository.findByNoteId(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> videoNoteService.remove(10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("No video attached to this note");
    }
}

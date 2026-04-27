package com.productivity.backend.service.external;

import com.productivity.backend.exception.ExternalServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GitHubModelsService {

    private static final String STUDY_ASSISTANT_SYSTEM_PROMPT = "You are a helpful study assistant.";

    @Value("${github.models.token:}")
    private String token;

    @Value("${github.models.base-url:https://models.github.ai/inference}")
    private String baseUrl;

    @Value("${github.models.model:}")
    private String model;

    @SuppressWarnings("unchecked")
    public String chat(String systemPrompt, String userPrompt) {
        ensureConfigured();

        try {
            RestClient client = RestClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeader("Authorization", "Bearer " + token)
                    .build();

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    )
            );

            Map<String, Object> response = client.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                throw new ExternalServiceException("Empty response from AI service");
            }

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new ExternalServiceException("No choices in AI response");
            }

            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            Object content = message != null ? message.get("content") : null;
            if (content == null) {
                throw new ExternalServiceException("AI response did not contain content");
            }

            return content.toString().trim();
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ExternalServiceException("AI service error: " + ex.getMessage(), ex);
        }
    }

    public String summarize(String plainText) {
        return chat(
                STUDY_ASSISTANT_SYSTEM_PROMPT,
                "Summarize the following study note as 3-5 concise bullet points. Return only the bullet points, no preamble.\n\n"
                        + plainText
        );
    }

    public String generateFlashcardsJson(String plainText) {
        return chat(
                STUDY_ASSISTANT_SYSTEM_PROMPT,
                "Generate flashcards from the following study note. Return a JSON array only, no markdown code fences. "
                        + "Each object must have keys: \"question\" (string), \"answer\" (string), "
                        + "\"difficulty\" (one of EASY, MEDIUM, HARD).\n\n" + plainText
        );
    }

    /**
     * Generate quiz questions (MCQ) from text. Returns JSON array.
     * Each object: question (string), options (array of 4 strings), correctAnswer (string), explanation (string).
     */
    public String generateQuizJson(String plainText) {
        return chat(
                STUDY_ASSISTANT_SYSTEM_PROMPT,
                "Generate multiple-choice quiz questions from the following study content. "
                        + "Return a JSON array only, no markdown code fences. "
                        + "Each object must have keys: \"question\" (string), \"options\" (array of exactly 4 strings), "
                        + "\"correctAnswer\" (string - must exactly match one of the options), "
                        + "\"explanation\" (string - brief explanation of the correct answer), "
                        + "\"difficulty\" (one of EASY, MEDIUM, HARD).\n\n" + plainText
        );
    }

    /**
     * Generate a structured note title and content from a video transcript.
     * Returns JSON: { "title": "...", "content": "..." }
     */
    public String generateNoteFromTranscript(String transcript) {
        return chat(
                "You are a helpful study assistant that creates well-structured study notes.",
                "Based on the following video transcript, create a comprehensive study note. "
                        + "Return JSON only, no markdown code fences. "
                        + "The JSON must have exactly two keys: "
                        + "\"title\" (a concise descriptive title for the note, max 80 chars), "
                        + "\"content\" (the note content in markdown format with headers, bullet points, "
                        + "key concepts, and important details from the video).\n\n"
                        + "Transcript:\n" + transcript
        );
    }

    /**
     * Suggest a topic name and relevant tags from note title + content.
     * Returns JSON: { "topicName": "...", "tags": ["tag1", "tag2", "tag3"] }
     */
    public String generateMetadataJson(String title, String content) {
        String truncated = content.length() > 2000 ? content.substring(0, 2000) + "..." : content;
        return chat(
                STUDY_ASSISTANT_SYSTEM_PROMPT,
                "Given the following study note title and content, suggest a topic category and 3-5 relevant tags. "
                        + "Return JSON only, no markdown code fences. "
                        + "The JSON must have exactly two keys: "
                        + "\"topicName\" (a short category name like 'Mathematics', 'Biology', 'History', etc.), "
                        + "\"tags\" (an array of 3-5 short lowercase tag strings, no spaces, use hyphens if needed).\n\n"
                        + "Title: " + title + "\n\nContent:\n" + truncated
        );
    }

    private void ensureConfigured() {
        if (token == null || token.isBlank()) {
            throw new ExternalServiceException("GitHub Models token is not configured");
        }
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new ExternalServiceException("GitHub Models base URL is not configured");
        }
        if (model == null || model.isBlank()) {
            throw new ExternalServiceException("GitHub Models model is not configured");
        }
    }
}

package com.productivity.backend.service.external;

import com.productivity.backend.exception.ExternalServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class SerpApiService {

    @Value("${serpapi.key:}")
    private String apiKey;

    @SuppressWarnings("unchecked")
    public String fetchTranscript(String videoId) {
        ensureConfigured();

        try {
            RestClient client = RestClient.create();

            Map<String, Object> response = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("serpapi.com")
                            .path("/search.json")
                            .queryParam("engine", "youtube_video_transcript")
                            .queryParam("v", videoId)
                            .queryParam("type", "asr")
                            .queryParam("api_key", apiKey)
                            .build())
                    .retrieve()
                    .body(Map.class);

            if (response == null || !response.containsKey("transcript")) {
                return "No transcript available for this video.";
            }

            List<Map<String, Object>> segments = (List<Map<String, Object>>) response.get("transcript");
            if (segments == null || segments.isEmpty()) {
                return "No transcript available for this video.";
            }

            StringBuilder transcript = new StringBuilder();
            for (Map<String, Object> segment : segments) {
                Object snippet = segment.get("snippet");
                if (snippet != null && !snippet.toString().isBlank()) {
                    transcript.append(snippet).append(' ');
                }
            }
            return transcript.toString().trim();
        } catch (ExternalServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ExternalServiceException("Failed to fetch transcript: " + ex.getMessage(), ex);
        }
    }

    private void ensureConfigured() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ExternalServiceException("SerpApi key is not configured");
        }
    }
}

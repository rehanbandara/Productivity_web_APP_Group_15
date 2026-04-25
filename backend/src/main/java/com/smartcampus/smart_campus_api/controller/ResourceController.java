package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.ResourceRequestDTO;
import com.smartcampus.smart_campus_api.dto.ResourceResponseDTO;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.model.ResourceType;
import com.smartcampus.smart_campus_api.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor

// frontend URL 
@CrossOrigin(origins = "http://localhost:5173") 
public class ResourceController {

    private final ResourceService resourceService;


    @GetMapping
    public ResponseEntity<List<ResourceResponseDTO>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {

        return ResponseEntity.ok(
                resourceService.getAllResources(type, status, location, minCapacity)
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

  
    @GetMapping("/code/{code}")
    public ResponseEntity<ResourceResponseDTO> getResourceByCode(@PathVariable String code) {
        return ResponseEntity.ok(resourceService.getResourceByCode(code));
    }


    @PostMapping
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.createResource(dto));
    }

 
    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
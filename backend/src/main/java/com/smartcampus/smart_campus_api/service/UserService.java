package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.UserResponseDTO;
import com.smartcampus.smart_campus_api.model.Role;
import java.util.List;

public interface UserService {
    List<UserResponseDTO> getAllUsers();          
    UserResponseDTO getUserById(Long id);
    UserResponseDTO updateUserRole(Long id, Role role);  
    void deleteUser(Long id);                   
}
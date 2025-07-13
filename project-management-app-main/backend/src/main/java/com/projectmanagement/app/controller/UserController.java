package com.projectmanagement.app.controller;

import com.projectmanagement.app.dto.MessageResponse;
import com.projectmanagement.app.dto.UserSummaryDto;
import com.projectmanagement.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<List<UserSummaryDto>> getAllUsers() {
        List<UserSummaryDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<UserSummaryDto> getUserById(@PathVariable Long id) {
        UserSummaryDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<UserSummaryDto> getCurrentUser() {
        UserSummaryDto user = userService.getCurrentUser();
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
}

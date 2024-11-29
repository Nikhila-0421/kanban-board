package org.example.kanbanase.Service;

import org.example.kanbanase.Entity.User;
import org.example.kanbanase.dto.LoginResponse;

import java.util.List;

public interface UserService {
    User createUser(User user);

    List<User> getAllUsers();

    User getUserById(String id);

    User getUserByEmail(String email);

    LoginResponse verifyLogin(String email, String password);

    void encodePassword(User user);
}
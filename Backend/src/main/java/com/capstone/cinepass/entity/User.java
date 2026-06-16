package com.capstone.cinepass.entity;


import com.capstone.cinepass.constant.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean isAdmin;

    public User(String email, String passwordHash, String name, boolean isAdmin) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        this.isAdmin = isAdmin;
    }

    public Role getRole() {
        return isAdmin ? Role.ADMIN : Role.USER;
    }
}

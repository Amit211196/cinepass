package com.capstone.cinepass.repository;

import com.capstone.cinepass.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class UserRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void existsByEmailReturnsTrueWhenUserExists() {
        userRepository.save(new User("exists@cinepass.com", "hashed", "Exists", false));

        boolean exists = userRepository.existsByEmail("exists@cinepass.com");

        assertThat(exists).isTrue();
    }

    @Test
    void findByEmailReturnsUserWhenPresent() {
        User saved = userRepository.save(new User("find@cinepass.com", "hashed", "Finder", false));

        Optional<User> found = userRepository.findByEmail("find@cinepass.com");

        assertThat(found).isPresent();
        assertThat(found.orElseThrow().getId()).isEqualTo(saved.getId());
    }

    @Test
    void findByEmailReturnsEmptyWhenMissing() {
        Optional<User> found = userRepository.findByEmail("missing@cinepass.com");

        assertThat(found).isEmpty();
    }
}




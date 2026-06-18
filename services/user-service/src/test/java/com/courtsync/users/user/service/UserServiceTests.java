package com.courtsync.users.user.service;

import com.courtsync.users.user.domain.SkillLevel;
import com.courtsync.users.user.domain.User;
import com.courtsync.users.user.domain.UserRole;
import com.courtsync.users.user.dto.UpdateUserProfileRequest;
import com.courtsync.users.user.exception.EmailAlreadyExistsException;
import com.courtsync.users.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTests {

    @Mock
    private UserRepository repository;

    @InjectMocks
    private UserService service;

    @Test
    void upsertCurrentUserCreatesProfileWithAuthUserIdAndEmail() {
        UUID authUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        String email = "player@example.com";
        UpdateUserProfileRequest request =
                new UpdateUserProfileRequest(" Ada ", " Lovelace ", SkillLevel.ADVANCED);

        when(repository.findByEmail(email)).thenReturn(Optional.empty());
        when(repository.findById(authUserId)).thenReturn(Optional.empty());
        when(repository.save(org.mockito.ArgumentMatchers.any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.upsertCurrentUser(authUserId, email, request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(repository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getId()).isEqualTo(authUserId);
        assertThat(saved.getEmail()).isEqualTo(email);
        assertThat(saved.getFirstName()).isEqualTo("Ada");
        assertThat(saved.getLastName()).isEqualTo("Lovelace");
        assertThat(saved.getSkillLevel()).isEqualTo(SkillLevel.ADVANCED);
        assertThat(saved.getRole()).isEqualTo(UserRole.PLAYER);
    }

    @Test
    void upsertCurrentUserRejectsEmailOwnedByAnotherProfile() {
        UUID authUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        User existing = new User();
        existing.setId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
        existing.setEmail("player@example.com");

        when(repository.findByEmail(existing.getEmail())).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.upsertCurrentUser(
                authUserId,
                existing.getEmail(),
                new UpdateUserProfileRequest(null, null, null)))
                .isInstanceOf(EmailAlreadyExistsException.class);
    }
}

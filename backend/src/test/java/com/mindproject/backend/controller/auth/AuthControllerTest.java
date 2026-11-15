package com.mindproject.backend.controller.auth;

import com.mindproject.backend.controller.auth.dto.LoginRequest;
import com.mindproject.backend.domain.account.UserProfile;
import com.mindproject.backend.service.auth.AuthResult;
import com.mindproject.backend.service.auth.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private HttpServletResponse servletResponse;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(authService);
    }

    @Test
    void signInReturnsTokenAndProfileAndSetsRefreshCookie() {
        when(authService.signIn("patient@example.com", "password")).thenReturn(new AuthResult("access-token", "refresh-token", UserProfile.PATIENT));

        var response = authController.signIn(new LoginRequest("patient@example.com", "password"), servletResponse);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("access-token", response.getBody().token());
        assertEquals(UserProfile.PATIENT, response.getBody().profile());
        verify(authService).signIn("patient@example.com", "password");
        ArgumentCaptor<Cookie> cookieCaptor = ArgumentCaptor.forClass(Cookie.class);
        verify(servletResponse).addCookie(cookieCaptor.capture());
        assertEquals("refreshToken", cookieCaptor.getValue().getName());
        assertEquals("refresh-token", cookieCaptor.getValue().getValue());
    }

    @Test
    void refreshReturnsTokenAndProfileAndRotatesRefreshCookie() {
        when(authService.refresh("old-refresh-token")).thenReturn(new AuthResult("new-access-token", "new-refresh-token", UserProfile.PROFESSIONAL));

        var response = authController.refresh("old-refresh-token", servletResponse);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("new-access-token", response.getBody().token());
        assertEquals(UserProfile.PROFESSIONAL, response.getBody().profile());
        ArgumentCaptor<Cookie> cookieCaptor = ArgumentCaptor.forClass(Cookie.class);
        verify(servletResponse).addCookie(cookieCaptor.capture());
        assertEquals("new-refresh-token", cookieCaptor.getValue().getValue());
    }

    @Test
    void logoutDeletesRefreshTokenAndExpiresCookie() {
        var response = authController.logout("refresh-token", servletResponse);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService).logout("refresh-token");
        ArgumentCaptor<Cookie> cookieCaptor = ArgumentCaptor.forClass(Cookie.class);
        verify(servletResponse).addCookie(cookieCaptor.capture());
        assertEquals("refreshToken", cookieCaptor.getValue().getName());
        assertEquals(0, cookieCaptor.getValue().getMaxAge());
    }
}

package com.projectmanagement.app.security.jwt;

import com.projectmanagement.app.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Value("${app.jwt.header}")
    private String headerName;
    
    @Value("${app.jwt.prefix}")
    private String headerPrefix;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String path = request.getRequestURI();
            logger.debug("Processing request to: {}", path);
            
            // Skip authentication for public endpoints
            if (path.startsWith("/api/auth/")) {
                logger.debug("Skipping authentication for public path: {}", path);
                filterChain.doFilter(request, response);
                return;
            }
            
            String jwt = parseJwt(request);
            logger.debug("JWT Token: {}", jwt != null ? "[HIDDEN]" : "null");
            
            if (jwt != null) {
                logger.debug("Validating JWT token...");
                if (jwtUtils.validateJwtToken(jwt)) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    logger.debug("JWT token is valid for user: {}", username);

                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.debug("User '{}' authenticated successfully", username);
                    } catch (Exception e) {
                        logger.error("Error loading user details: {}", e.getMessage(), e);
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: User not found");
                        return;
                    }
                } else {
                    logger.warn("JWT token validation failed");
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Invalid token");
                    return;
                }
            } else {
                logger.debug("No JWT token found in request");
                // Don't block the request here, let the controller's @PreAuthorize handle it
            }
        } catch (Exception e) {
            logger.error("Authentication error: {}", e.getMessage(), e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "An error occurred during authentication");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader(headerName);

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith(headerPrefix)) {
            return headerAuth.substring(headerPrefix.length());
        }

        return null;
    }
}

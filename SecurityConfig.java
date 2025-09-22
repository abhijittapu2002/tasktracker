package com.misboi.jwtlogin.config;

import com.misboi.jwtlogin.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    /** ✅ Configure authentication manager */
    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /** ✅ Use BCrypt for password encryption */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** ✅ Main security configuration */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // ✅ Disable CSRF for APIs
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ Configure CORS properly
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // ✅ Stateless authentication
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/authenticate", "/register", "/reset/**","/activities/**").permitAll() // ✅ Public access
                        .requestMatchers("/api/users/**").authenticated()
                        .requestMatchers("/api/users/{username}","/projectmaster/**","/activitymaster/**","/documents/**","/status/**","/remarks/**","/subactivities/**").authenticated() // ✅ Any logged-in user can fetch their details
                        .requestMatchers("/tasktracker/admin/**").hasAuthority("ROLE_ADMIN") // ✅ Admin-only task access
                        .requestMatchers("/tasktracker/user/**").hasAuthority("ROLE_USER") // ✅ User-specific task access
                        .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN") // ✅ Admin-specific routes
                        .requestMatchers("/user/**").hasAuthority("ROLE_USER") // ✅ User-specific routes
                        .anyRequest().authenticated()) // ✅ Require authentication for everything else
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** ✅ Explicitly configure CORS to allow frontend requests */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));  // ✅ Allow Angular frontend
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // ✅ Allow all necessary methods
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept")); // ✅ Restrict headers for security
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // ✅ Apply globally
        return source;
    }
}
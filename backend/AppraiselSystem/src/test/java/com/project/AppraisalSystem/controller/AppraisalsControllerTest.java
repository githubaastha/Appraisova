package com.project.AppraisalSystem.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
public class AppraisalsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Value("${test.neha.email}")
    private String nehaEmail;

    @Value("${test.neha.password}")
    private String nehaPassword;

    private String loginAndGetToken(String email, String password) throws Exception {
        String requestBody = String.format("""
                {
                    "email": "%s",
                    "password": "%s"
                }
                """, email, password);

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andReturn()
                .getResponse()
                .getContentAsString();

        return response.split("\"token\":\"")[1].split("\"")[0];
    }

    @Test
    void employeeCannotViewAnotherEmployeesAppraisal() throws Exception {
        String nehaToken = loginAndGetToken(nehaEmail, nehaPassword);

        mockMvc.perform(get("/api/appraisals/7")
                        .header("Authorization", "Bearer " + nehaToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void employeeCanViewTheirOwnAppraisal() throws Exception {
        String nehaToken = loginAndGetToken(nehaEmail, nehaPassword);

        mockMvc.perform(get("/api/appraisals/6")
                        .header("Authorization", "Bearer " + nehaToken))
                .andExpect(status().isOk());
    }

    @Test
    void loginWithBlankEmail_shouldReturn400() throws Exception {
        String requestBody = """
                {
                    "email": "",
                    "password": "somepassword123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void employeeCannotViewAllAppraisals() throws Exception {
        String nehaToken = loginAndGetToken(nehaEmail, nehaPassword);

        mockMvc.perform(get("/api/appraisals")
                        .header("Authorization", "Bearer " + nehaToken))
                .andExpect(status().isForbidden());
    }
}
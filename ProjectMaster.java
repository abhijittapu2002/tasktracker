package com.misboi.jwtlogin.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "project_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMaster {

    @Id
    private Long projId;

    private String projName;
    private String projDesc;

    private String projCode;   // ✅ New field for unique project code
    private String status;     // ✅ New field for project status

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;
}



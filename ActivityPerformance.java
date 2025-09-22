package com.misboi.jwtlogin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "activity_performance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to ActivityMaster
    @OneToOne
    @JoinColumn(name = "activity_id", nullable = false)
    private ActivityMaster activity;

    private Integer totalSubActivities;
    private Integer completedSubActivities;
    private Double weightagePercentage; // 0–100
}

package com.misboi.jwtlogin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Entity
@Table(name = "stt_remarks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Remarks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slNo;

    private String remarks;
    @ManyToOne
    @JoinColumn(name = "act_id")
    private ActivityMaster activity;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

}

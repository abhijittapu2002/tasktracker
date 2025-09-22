package com.misboi.jwtlogin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private Long actId;
    private String starttime;
    private String endtime;
    private String dueDate; // ✅ new field
    private int priority;
    private Long statusId;
    private String remarks;
    private boolean important;
    private boolean urgent;
    private Long userId;
    private String reportTo;
}

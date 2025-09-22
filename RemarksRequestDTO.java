package com.misboi.jwtlogin.dto;

import lombok.Data;

@Data
public class RemarksRequestDTO {
    private String remarks;
    private Long activityId;
    private Long userId;
}
 
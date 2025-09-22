//package com.misboi.jwtlogin.model;
//
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.time.ZonedDateTime;
//
//@Entity
//@Table(name = "sub_activity")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class SubActivity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long subActId;
//
//    private String subActName;
//    private String subActDesc;
//    private Boolean status;
//
//    @Column(name = "created_by")
//    private String createdBy;
//
//    @Column(name = "created_at")
//    private ZonedDateTime createdAt;
//
//    // Foreign Key (Many SubActivities belong to one Activity)
//    @ManyToOne
//    @JoinColumn(name = "act_id", nullable = false)
//    private ActivityMaster activity;
//}




//package com.misboi.jwtlogin.model;
//
//import com.fasterxml.jackson.annotation.JsonBackReference;
//import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.time.ZonedDateTime;
//
//@Entity
//@Table(name = "sub_activity")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class SubActivity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "sub_act_id")
//    private Long subActId;
//
//
//    private String subActName;
//    private String subActDesc;
//
//    @Enumerated(EnumType.STRING)
//    private SubActivityStatus status;
//
//    @Column(name = "created_by")
//    private String createdBy;
//
//    @Column(name = "created_at")
//    private ZonedDateTime createdAt;
//
//    // Foreign Key (Many SubActivities belong to one Activity)
//    @ManyToOne
//    @JoinColumn(name = "act_id", nullable = false)
//    @JsonIgnoreProperties({"subActivities"})  // 👈 Include Activity but ignore its subActivities to avoid loop
//    private ActivityMaster activity;
//}



package com.misboi.jwtlogin.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.ZonedDateTime;

@Entity
@Table(name = "sub_activity")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sub_act_id")
    private Long subActId;

    private String subActName;
    private String subActDesc;

    @Enumerated(EnumType.STRING)
    private SubActivityStatus status;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    // ✅ New fields
    @Column(name = "start_date")
    private ZonedDateTime startDate;

    @Column(name = "end_date")
    private ZonedDateTime endDate;

    // Many SubActivities → One Activity
    @ManyToOne
    @JoinColumn(name = "act_id", nullable = false)
    @JsonBackReference   // ✅ child side
    @ToString.Exclude    // 🔴 prevent recursion
    private ActivityMaster activity;
}



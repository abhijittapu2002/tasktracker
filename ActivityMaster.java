//
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
//@Table(name = "activity_master")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class ActivityMaster {
//    @Id
//    private Long actId;
//
//    private String actName;
//    private String actDesc;
//
//    private Boolean status;
//
//    @Column(name = "created_by")
//    private String createdBy;
//
//    @Column(name = "created_at")
//    private ZonedDateTime createdAt;
//
//    @ManyToOne
//    @JoinColumn(name = "proj_id")
//    private ProjectMaster project;
//
//
//}
//




//package com.misboi.jwtlogin.model;
//
//import com.fasterxml.jackson.annotation.JsonManagedReference;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//import java.time.ZonedDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "activity_master")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class ActivityMaster {
//
//    @Id
//    private Long actId;
//
//    private String actName;
//    private String actDesc;
//
//    private Boolean status;
//
//    @Column(name = "created_by")
//    private String createdBy;
//
//    @Column(name = "created_at")
//    private ZonedDateTime createdAt;
//
//    @ManyToOne
//    @JoinColumn(name = "proj_id")
//    private ProjectMaster project;
//
//    // One Activity → Many SubActivities
//    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
//    //@JsonManagedReference   // 👈 Prevents recursion when serializing Activity → SubActivity
//    private List<SubActivity> subActivities;
//}



package com.misboi.jwtlogin.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "activity_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityMaster {

    @Id
    private Long actId;

    private String actName;
    private String actDesc;
    private Boolean status;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "proj_id")
    @ToString.Exclude   // 🔴 prevent recursion in Lombok
    private ProjectMaster project;

    // One Activity → Many SubActivities
    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference   // ✅ parent side
    @ToString.Exclude
    private List<SubActivity> subActivities = new ArrayList<>();
}


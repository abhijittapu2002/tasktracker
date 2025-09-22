//package com.misboi.jwtlogin;
//
//import com.misboi.jwtlogin.model.ActivityMaster;
//import com.misboi.jwtlogin.model.Status;
//import com.misboi.jwtlogin.model.User;
//import jakarta.annotation.PostConstruct;
//import jakarta.annotation.PreDestroy;
//import jakarta.persistence.*;
//import lombok.*;
//
//@Entity
//@Table(name = "tasktracker")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class Entitylist {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private long id;
//
//    @ManyToOne
//    @JoinColumn(name = "act_id")
//    private ActivityMaster activity;
//
//    private String starttime;
//    private String endtime;
//    private String dueDate; // ✅ New field for due date
//    @ManyToOne
//    @JoinColumn(name = "status_id")
//    private Status status;
//    private int priority;
//    private String remarks;
//    private boolean important;
//    private boolean urgent;
//
//    @ManyToOne
//    @JoinColumn(name = "user_id")
//    private User user;
//
//    private String reportTo; // reporting manager
//
//    // ✅ JPA Lifecycle Hooks
//    @PostConstruct
//    public void postConstruct() { System.out.println("Entity Created: " + this); }
//
//    @PrePersist
//    public void prePersist() { System.out.println("Entity about to be persisted: " + this); }
//
//    @PostPersist
//    public void postPersist() { System.out.println("Entity persisted: " + this); }
//
//    @PreUpdate
//    public void preUpdate() { System.out.println("Entity about to be updated: " + this); }
//
//    @PostUpdate
//    public void postUpdate() { System.out.println("Entity updated: " + this); }
//
//    @PreRemove
//    public void preRemove() { System.out.println("Entity about to be removed: " + this); }
//
//    @PostRemove
//    public void postRemove() { System.out.println("Entity removed: " + this); }
//
//    @PostLoad
//    public void postLoad() { System.out.println("Entity loaded: " + this); }
//
//    @PreDestroy
//    public void preDestroy() { System.out.println("Entity about to be destroyed: " + this); }
//}



package com.misboi.jwtlogin;

import com.misboi.jwtlogin.model.ActivityMaster;
import com.misboi.jwtlogin.model.Status;
import com.misboi.jwtlogin.model.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tasktracker")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entitylist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "act_id")
    @ToString.Exclude   // 🔴 prevent recursion
    private ActivityMaster activity;

    private String starttime;
    private String endtime;
    private String dueDate;

    @ManyToOne
    @JoinColumn(name = "status_id")
    @ToString.Exclude   // 🔴 prevent recursion
    private Status status;

    private int priority;
    private String remarks;
    private boolean important;
    private boolean urgent;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @ToString.Exclude   // 🔴 prevent recursion
    private User user;

    private String reportTo; // reporting manager

    // 🚫 Removed this.toString() calls → avoids StackOverflowError
    @PrePersist
    public void prePersist() {
        System.out.println("Entity about to be persisted: id=" + id + ", remarks=" + remarks);
    }

    @PostPersist
    public void postPersist() {
        System.out.println("Entity persisted: id=" + id);
    }

    @PreUpdate
    public void preUpdate() {
        System.out.println("Entity about to be updated: id=" + id);
    }

    @PostUpdate
    public void postUpdate() {
        System.out.println("Entity updated: id=" + id);
    }

    @PreRemove
    public void preRemove() {
        System.out.println("Entity about to be removed: id=" + id);
    }

    @PostRemove
    public void postRemove() {
        System.out.println("Entity removed: id=" + id);
    }

    @PostLoad
    public void postLoad() {
        System.out.println("Entity loaded: id=" + id);
    }
}


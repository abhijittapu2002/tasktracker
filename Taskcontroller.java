//package com.misboi.jwtlogin;
//
//import org.springframework.web.bind.annotation.*;
//import java.util.List;
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/tasktracker")
//public class Taskcontroller {
//    private final Trackerservice trackerservice;
//
//    public Taskcontroller(Trackerservice trackerservice) {
//        this.trackerservice = trackerservice;
//    }
//
//    @GetMapping
//    public List<Entitylist> getAllEntitylists() {
//        return trackerservice.getAllEntitylists();
//    }
//
//    @GetMapping("/{id}")
//    public Optional<Entitylist> getEntitylistById(@PathVariable Long id) {
//        return trackerservice.getEntitylistById(id);
//    }
//
//    @PostMapping
//    public Entitylist createEntitylist(@RequestBody Entitylist entitylist) {
//        return trackerservice.createEntitylist(entitylist);
//    }
//
//    @PutMapping("/{id}")
//    public Entitylist updateEntitylist(@PathVariable Long id, @RequestBody Entitylist entitylist) {
//        return trackerservice.updateEntitylist(id, entitylist);
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteEntitylist(@PathVariable Long id) {
//        trackerservice.deleteEntitylist(id);
//    }
//
//    @GetMapping("/filter")
//    public List<Entitylist> getTasksByUrgencyAndImportance(@RequestParam boolean important, @RequestParam boolean urgent) {
//        return trackerservice.getTasksByUrgencyAndImportance(important, urgent);
//    }
//}

package com.misboi.jwtlogin;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tasktracker")
public class Taskcontroller {

    private final Trackerservice trackerservice;

    public Taskcontroller(Trackerservice trackerservice) {
        this.trackerservice = trackerservice;
    }

//    @GetMapping
//    public List<Entitylist> getAllEntitylists() {
//        return trackerservice.getAllEntitylists();
//    }
    @GetMapping
    public List<Entitylist> getAllEntitylists() {
        return trackerservice.getTasksForCurrentUser();
    }

    @GetMapping("/{id}")
    public Optional<Entitylist> getEntitylistById(@PathVariable Long id) {
        return trackerservice.getEntitylistById(id);
    }

    @PostMapping
    public Entitylist createEntitylist(@RequestBody TaskDto taskDto) {
        return trackerservice.createTask(taskDto);
    }

    @PutMapping("/{id}")
    public Entitylist updateEntitylist(@PathVariable Long id, @RequestBody TaskDto taskDto) {
        return trackerservice.updateEntitylist(id, taskDto);
    }


    @DeleteMapping("/{id}")
    public void deleteEntitylist(@PathVariable Long id) {
        trackerservice.deleteEntitylist(id);
    }

//    @GetMapping("/filter")
//    public List<Entitylist> getTasksByUrgencyAndImportance(@RequestParam boolean important, @RequestParam boolean urgent) {
//        return trackerservice.getTasksByUrgencyAndImportance(important, urgent);
//    }
@GetMapping("/filter")
public List<Entitylist> getTasksByUrgencyAndImportance(@RequestParam boolean important, @RequestParam boolean urgent) {
    return trackerservice.getTasksByUrgencyAndImportanceForCurrentUser(important, urgent);
}
}

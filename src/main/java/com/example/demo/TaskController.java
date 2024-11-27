package com.example.demo;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class TaskController {
    Task[] taskList = {};

    @GetMapping("/test")
    public String testerFunction() {
        return "testing...";
    }

    @GetMapping("/getTasks")
    public Task[] getTasks() {
        return taskList;
    }

    @GetMapping("/listTasks")
    public void listTasks() {
        System.out.println(taskList.toString());
    }
}
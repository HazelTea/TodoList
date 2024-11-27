package com.example.demo;

import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Array;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class TaskController {
    private static Task[] taskList = { new Task("hard", "bone") };

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

    @PostMapping
    public Task[] addTask(@RequestParam String title) {
        Task newTask = new Task(title, "balls");
        Task[] newTaskList = new Task[taskList.length + 1];
        for (int i = 0; i < taskList.length; i++) {
            newTaskList[i] = taskList[i];
        }
        newTaskList[taskList.length] = newTask;
        return newTaskList;
    }
}
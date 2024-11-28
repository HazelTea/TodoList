package com.example.demo;

import java.util.Date;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.beans.factory.annotation.Autowired;

@Controller
public class TaskController {
    @Autowired
    private TaskList taskList;

    @GetMapping("/test")
    public String testerFunction() {
        return "testing...";
    }

    @GetMapping("/tasks")
    public @ResponseBody Iterable<Task> getTasks() {
        // Statement st = con.createStatement();
        return taskList.findAll();
    }

    @PostMapping("/tasks")
    public @ResponseBody String addTask(@RequestParam Map<String, String> params) {
        String title = params.get("title");
        String description = params.get("description");
        Task newTask = new Task();
        newTask.setTitle(title);
        newTask.setDescription(description);
        taskList.save(newTask);
        return "Saved";
    }

    @GetMapping("/tasks/list")
    public void listTasks() {
        System.out.println(taskList.toString());
    }

    // @GetMapping("/tasks/{id}")
    // public Task getTaskById(@PathVariable("id") Long id) {
    // Task chosenTask = null;
    // }
    // }
    // return chosenTask;
    // }

    // @DeleteMapping("/tasks/{id}")
    // public TaskList removeTask(@PathVariable("id") Long id) {
    // int currentIndex = 0;
    // Task[] newTaskList = new Task[taskList.length - 1];
    // for (int i = 0; i < taskList.length; i++) {
    // Task task = taskList[i];
    // if (task.id() != id) {
    // newTaskList[currentIndex] = task;
    // currentIndex++;
    // }
    // }
    // taskList = newTaskList;
    // return taskList;

    // }
}
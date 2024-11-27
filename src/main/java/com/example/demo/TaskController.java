package com.example.demo;

import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class TaskController {
    private static Task[] taskList = { new Task(1, "hard", "bone"), new Task(2, "hard", "bone") };

    @GetMapping("/test")
    public String testerFunction() {
        return "testing...";
    }

    @GetMapping("/tasks")
    public Task[] getTasks() {
        return taskList;
    }

    @GetMapping("/tasks/list")
    public void listTasks() {
        System.out.println(taskList.toString());
    }

    @GetMapping("/tasks/{id}")
    public Task getTaskById(@PathVariable("id") Long id) {
        Task chosenTask = null;
        for (Task task : taskList) {
            if (task.id() == id) {
                chosenTask = task;
                break;
            }
        }
        return chosenTask;
    }

    @PostMapping("/tasks")
    public Task[] addTask(@RequestParam Map<String, String> params) {
        String title = params.get("title");
        String description = params.get("description");
        Long id = new Date().getTime();
        Task newTask = new Task(id, title, description);
        Task[] newTaskList = new Task[taskList.length + 1];
        for (int i = 0; i < taskList.length; i++) {
            newTaskList[i] = taskList[i];
        }
        newTaskList[taskList.length] = newTask;
        taskList = newTaskList;
        return newTaskList;
    }

    @DeleteMapping("/tasks/{id}")
    public Task[] removeTask(@PathVariable("id") Long id) {
        int currentIndex = 0;
        Task[] newTaskList = new Task[taskList.length - 1];
        for (int i = 0; i < taskList.length; i++) {
            Task task = taskList[i];
            if (task.id() != id) {
                System.out.println("TASK ID");
                System.out.println(task.id());
                newTaskList[currentIndex] = task;
                currentIndex++;
            }
        }
        taskList = newTaskList;
        return taskList;

    }
}
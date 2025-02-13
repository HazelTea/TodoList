package com.example.demo;

import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.PathVariable;
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
        return taskList.findAll();
    }

    @PostMapping("/tasks")
    public @ResponseBody Task addTask(@RequestParam Map<String, String> params) {
        String title = params.get("title");
        String description = params.get("description");
        String deadline = params.get("deadline");
        Task newTask = new Task();
        newTask.setTitle(title);
        newTask.setDescription(description);
        newTask.setDeadline(deadline);
        newTask.setFinishedStatus(false);
        taskList.save(newTask);
        return newTask;
    }

    @GetMapping("/tasks/list")
    public void listTasks() {
        System.out.println(taskList.toString());
    }

    @GetMapping("/tasks/{id}")
    public @ResponseBody Task getTaskById(@PathVariable("id") Integer id) {
        return taskList.findById(id).orElseThrow();

    }

    @DeleteMapping("/tasks/{id}")
    public @ResponseBody Iterable<Task> removeTask(@PathVariable("id") Integer id) {
        try {
            taskList.deleteById(id);

        } catch (Exception e) {
            System.out.println("No task with a matching id of: " + id.toString() + " was found!");
            return null;
        }
        return taskList.findAll();

    }

    @PatchMapping("/tasks/{id}/edit")
    public @ResponseBody Task editTask(@PathVariable("id") Integer id,
            @RequestParam Map<String, String> params) {
        Task task = getTaskById(id);
        task.setTitle(params.get("title"));
        task.setDescription(params.get("description"));
        task.setDeadline(params.get("deadline"));
        taskList.save(task);
        return task;
    }
}
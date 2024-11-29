package com.example.demo;

import org.springframework.data.repository.CrudRepository;

public interface TaskList extends CrudRepository<Task, Integer> {

}
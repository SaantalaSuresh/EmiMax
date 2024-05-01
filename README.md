# Epimax Task Management API

This is a simple Task Management API built with Node.js, Express.js, and SQLite. It allows users to perform CRUD operations on tasks.

## Features

- User authentication (JWT)
- Create, Read, Update, and Delete tasks
- Store tasks in an SQLite database

## Prerequisites

- Node.js installed on your local machine
- SQLite3 installed on your local machine

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repository.git

## API Endpoints

- POST /login: User login
- POST /register: User registration
- GET /tasks: Get all tasks
- GET /tasks/:id: Get a specific task
- POST /tasks: Create a new task
- PUT /tasks/:id: Update a task
- DELETE /tasks/:id: Delete a task

    ## Example Task Object
     {
        "id": 10,
        "title": "RescueTime",
        "description": "This is a new task",
        "status": "pending",
        "assignee_id": 10,
        "created_at": "2024-05-01 05:43:20",
        "updated_at": "2024-05-01 05:43:20"
     }


## Technologies Used
1. Node.js
2. Express.js
3. SQLite
4. bcrypt
5. JSON Web Tokens (JWT)
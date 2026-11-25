
/* =====================================
   1. GET HTML ELEMENTS
===================================== */

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskCategory = document.getElementById("taskCategory");
const taskDate = document.getElementById("taskDate");

const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const activeTasks = document.getElementById("activeTasks");
const completedTasks = document.getElementById("completedTasks");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

const filterButtons = document.querySelectorAll(".filter-btn");


/* =====================================
   2. LOAD AND SAVE TASKS
===================================== */

// Get saved tasks from local storage

function loadTasks() {

    try {
        const savedTasks = localStorage.getItem("tasks");

        if (savedTasks) {
            return JSON.parse(savedTasks);
        }

        return [];

    } catch (error) {
        console.log("Error loading tasks:", error);
        return [];
    }
}


// Store all tasks in an array

let tasks = loadTasks();


// Save tasks whenever changes are made

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// Default filter

let currentFilter = "all";


/* =====================================
   3. ADD NEW TASK
===================================== */

taskForm.addEventListener("submit", function(event) {

    // Stop the page from refreshing

    event.preventDefault();


    // Get values from the form

    const taskName = taskInput.value.trim();
    const category = taskCategory.value;
    const dueDate = taskDate.value;


    // Check whether task name is empty

    if (taskName === "") {
        alert("Please enter a task!");
        return;
    }


    // Create a new task

    const newTask = {
        id: Date.now(),
        name: taskName,
        category: category,
        date: dueDate,
        completed: false
    };


    // Add task to the array

    tasks.push(newTask);


    // Clear the form

    taskForm.reset();


    // Display updated task list

    renderTasks();

});


/* =====================================
   4. DISPLAY TASKS
===================================== */

function renderTasks() {

    // Clear the old task list

    taskList.innerHTML = "";


    // Get search value

    const searchText = searchInput.value.toLowerCase().trim();


    // Filter tasks based on search and selected filters

    const filteredTasks = tasks.filter(function(task) {

        const matchesSearch = task.name.toLowerCase().includes(searchText);


        // Check selected status filter

        const matchesStatus =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);


        // Check selected category

        const matchesCategory =
            categoryFilter.value === "all" ||
            task.category === categoryFilter.value;


        return matchesSearch && matchesStatus && matchesCategory;

    });


    // Show message when no tasks are available

    if (filteredTasks.length === 0) {

        const message = document.createElement("p");

        message.className = "empty-message";

        if (tasks.length === 0) {
            message.textContent = "No tasks yet. Add your first task!";
        } else {
            message.textContent = "No matching tasks found.";
        }

        taskList.appendChild(message);

    }


    // Display every filtered task

    filteredTasks.forEach(function(task) {

        // Create task card

        const taskCard = document.createElement("div");

        taskCard.className = "task-card";


        // Add completed style

        if (task.completed) {
            taskCard.classList.add("completed");
        }


        // Show a small animation when task status changes

        if (task.justToggled) {
            taskCard.classList.add("completion-animation");
            task.justToggled = false;
        }


        /* =====================================
           DRAG AND DROP
        ===================================== */

        taskCard.setAttribute("draggable", "true");


        // When dragging starts

        taskCard.addEventListener("dragstart", function(event) {

            event.dataTransfer.setData("text/plain", task.id);

            taskCard.classList.add("dragging");

        });


        // When dragging ends

        taskCard.addEventListener("dragend", function() {

            taskCard.classList.remove("dragging");

        });


        // Allow another task to be dropped here

        taskCard.addEventListener("dragover", function(event) {

            event.preventDefault();

        });


        // Change task order after dropping

        taskCard.addEventListener("drop", function(event) {

            event.preventDefault();

            const draggedId = Number(
                event.dataTransfer.getData("text/plain")
            );

            const targetId = task.id;


            // Do nothing if the same task is selected

            if (draggedId === targetId) {
                return;
            }


            // Find both task positions

            const draggedIndex = tasks.findIndex(function(item) {
                return item.id === draggedId;
            });

            const targetIndex = tasks.findIndex(function(item) {
                return item.id === targetId;
            });


            // Check whether both tasks exist

            if (draggedIndex === -1 || targetIndex === -1) {
                return;
            }


            // Remove dragged task from its old position

            const draggedTask = tasks.splice(draggedIndex, 1)[0];


            // Find the target task again

            const newTargetIndex = tasks.findIndex(function(item) {
                return item.id === targetId;
            });


            // Place dragged task before the target task

            tasks.splice(newTargetIndex, 0, draggedTask);


            // Save and display the new order

            saveTasks();
            renderTasks();

        });


        /* =====================================
           TASK INFORMATION
        ===================================== */

        const taskInfo = document.createElement("div");

        taskInfo.className = "task-info";


        // Task name

        const taskTitle = document.createElement("h3");

        taskTitle.textContent = task.name;


        // Task category and due date

        const taskDetails = document.createElement("p");

        taskDetails.textContent =
            "Category: " + task.category +
            (task.date ? " | Due: " + task.date : "");


        // Add information to task card

        taskInfo.appendChild(taskTitle);
        taskInfo.appendChild(taskDetails);


        /* =====================================
           TASK BUTTONS
        ===================================== */

        const buttonContainer = document.createElement("div");

        buttonContainer.className = "task-actions";


        // Complete or Undo button

        const completeButton = document.createElement("button");

        completeButton.textContent = task.completed ? "Undo" : "Complete";

        completeButton.className = "complete-btn";

        completeButton.addEventListener("click", function() {

            toggleTask(task.id);

        });


        // Edit button

        const editButton = document.createElement("button");

        editButton.textContent = "Edit";

        editButton.className = "edit-btn";

        editButton.addEventListener("click", function() {

            editTask(task.id);

        });


        // Delete button

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {

            deleteTask(task.id);

        });


        // Add buttons to the container

        buttonContainer.appendChild(completeButton);
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);


        // Add information and buttons to the card

        taskCard.appendChild(taskInfo);
        taskCard.appendChild(buttonContainer);


        // Display the card on the webpage

        taskList.appendChild(taskCard);

    });


    // Update dashboard numbers

    updateDashboard();


    // Save the latest task details

    saveTasks();

}


/* =====================================
   5. EDIT TASK
===================================== */

function editTask(id) {

    // Find the selected task

    const task = tasks.find(function(item) {
        return item.id === id;
    });


    if (!task) {
        return;
    }


    // Ask for updated task name

    const newName = prompt("Enter updated task name:", task.name);


    // Stop if user clicks Cancel

    if (newName === null) {
        return;
    }


    if (newName.trim() === "") {
        alert("Task name cannot be empty!");
        return;
    }


    // Update task name

    task.name = newName.trim();


    // Ask for updated category

    const newCategory = prompt(
        "Enter category: Work, Personal or Study",
        task.category
    );


    if (newCategory !== null && newCategory.trim() !== "") {

        const validCategories = ["Work", "Personal", "Study"];

        const selectedCategory = validCategories.find(function(category) {

            return category.toLowerCase() === newCategory.trim().toLowerCase();

        });


        if (selectedCategory) {
            task.category = selectedCategory;
        } else {
            alert("Invalid category. Keeping the old category.");
        }

    }


    // Ask for updated due date

    const newDate = prompt(
        "Enter due date (YYYY-MM-DD), or leave empty:",
        task.date
    );


    if (newDate !== null) {

        const dateValue = newDate.trim();

        if (
            dateValue === "" ||
            /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
        ) {
            task.date = dateValue;
        } else {
            alert("Invalid date format. Keeping the old date.");
        }

    }


    // Display updated details

    renderTasks();

}


/* =====================================
   6. DELETE TASK
===================================== */

function deleteTask(id) {

    // Ask user before deleting

    const confirmation = confirm(
        "Are you sure you want to delete this task?"
    );


    if (confirmation) {

        // Remove the selected task

        tasks = tasks.filter(function(task) {
            return task.id !== id;
        });


        // Update task list

        renderTasks();

    }

}


/* =====================================
   7. COMPLETE OR UNDO TASK
===================================== */

function toggleTask(id) {

    // Find the selected task

    const task = tasks.find(function(item) {
        return item.id === id;
    });


    if (task) {

        // Change completed status

        task.completed = !task.completed;

        // Used for completion animation

        task.justToggled = true;


        // Update webpage

        renderTasks();

    }

}


/* =====================================
   8. UPDATE DASHBOARD
===================================== */

function updateDashboard() {

    // Count all tasks

    const total = tasks.length;


    // Count completed tasks

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;


    // Find active tasks

    const active = total - completed;


    // Display the numbers

    totalTasks.textContent = total;

    activeTasks.textContent = active;

    completedTasks.textContent = completed;

}


/* =====================================
   9. SEARCH TASKS
===================================== */

searchInput.addEventListener("input", function() {

    // Refresh task list while typing

    renderTasks();

});


/* =====================================
   10. ALL / ACTIVE / COMPLETED FILTER
===================================== */

filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // Get selected filter name

        currentFilter = button.dataset.filter;


        // Remove active style from all buttons

        filterButtons.forEach(function(item) {
            item.classList.remove("active");
        });


        // Highlight selected button

        button.classList.add("active");


        // Display filtered tasks

        renderTasks();

    });

});


/* =====================================
   11. CATEGORY FILTER
===================================== */

categoryFilter.addEventListener("change", function() {

    // Display tasks from selected category

    renderTasks();

});


/* =====================================
   12. FIRST DISPLAY
===================================== */

// Show saved tasks when page opens

renderTasks();

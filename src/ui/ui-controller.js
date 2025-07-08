// ui/ui-controller.js

import { addProject, getProjects, addTodoProject, getCurrentProject, getProject } from "../modules/app.js";
import { renderProjectList, renderTodoList } from "./dom.js";
import Project from "../modules/project.js";
import Todo from "../modules/todo.js";

/**
 * Sets up the event handler for the add project form.
 */
export function setupProjectFormHandler() {
    // Get the form element, not just the button.
    const addProjectForm = document.getElementById('add-project-form');
    // Get the project name input field by its correct ID from template.html.
    const projectNameInput = document.getElementById('add-project-input');

    // Listen for the 'submit' event on the form itself.
    addProjectForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent the default form submission (which causes page reload).

        const projectName = projectNameInput.value.trim();
        if (!projectName) {
            return alert("Oops! You forgot to name your project.");
        }

        const newProject = new Project(projectName);
        addProject(newProject);
        renderProjectList(getProjects());
        projectNameInput.value = ''; // Clear the input field after submission.

        // Optional: Automatically select the newly created project and display its todos.
        // This simulates a click on the new project element to activate it.
        const projectElement = document.querySelector(`[data-id="${newProject.id}"]`);
        if (projectElement) {
            projectElement.click();
        }
    });
}

/**
 * Sets up the event handler for the add todo form.
 */
export function setupTodoFormHandler() {
    // Get the todo form element.
    const addTodoForm = document.getElementById("add-todo-form");
    // Get all the input fields for the todo. Ensure IDs match template.html.
    const todoTitleInput = document.getElementById("add-todo-title");
    const todoDescriptionInput = document.getElementById("add-todo-description");
    const todoDueDateInput = document.getElementById("add-todo-dueDate");
    const todoPrioritySelect = document.getElementById("add-todo-priority");
    const todoNotesInput = document.getElementById("add-todo-notes"); // Correct ID for notes input.

    // Listen for the 'submit' event on the todo form.
    addTodoForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent the default form submission.

        const todoTitle = todoTitleInput.value.trim();
        const todoDescription = todoDescriptionInput.value.trim();
        const todoDate = todoDueDateInput.value;
        const todoPriority = todoPrioritySelect.value;
        const todoNotes = todoNotesInput.value.trim();

        if (!todoTitle) {
            alert("Please enter a title for your todo");
            return;
        }

        if (!todoDate) {
            alert("Please enter a date for your todo");
            return;
        }

        const currentProject = getCurrentProject();

        if (!currentProject) {
            alert("Please select a project before adding a todo.");
            return;
        }

        // Create a new Todo instance, passing the notes as well.
        const myTodo = new Todo(todoTitle, todoDescription, todoDate, todoPriority, todoNotes, false, currentProject.id);

        console.log("Todo created:", myTodo);
        addTodoProject(myTodo, currentProject.id); // Add the todo to the current project.

        console.log("Project updated:", getCurrentProject()); // Verify project after adding.

        // Re-render the list of todos for the current project to update the UI.
        renderTodoList(currentProject.todos);

        // Clear the todo form fields after submission.
        todoTitleInput.value = '';
        todoDescriptionInput.value = '';
        todoDueDateInput.value = '';
        todoPrioritySelect.value = 'medium'; // Reset to default value.
        todoNotesInput.value = ''; // Clear notes input.
    });
}
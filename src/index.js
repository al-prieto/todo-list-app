// index.js

// Import CSS styles.
import "./styles/styles.css";

// Import core application logic functions.
import { addProject, getProjects, getProject, loadProjectsFromLocalStorage } from "./modules/app.js";

// Import DOM rendering functions.
import { renderProjectList, renderTodoList } from "./ui/dom.js";

// Import functions to set up form handlers.
import { setupProjectFormHandler, setupTodoFormHandler } from "./ui/ui-controller.js";

// Import Project and Todo classes for object instantiation.
import Project from "./modules/project.js";
import Todo from "./modules/todo.js";


// Initialize the application after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {

    // Load projects from localStorage.
    loadProjectsFromLocalStorage();

    // Determine the initial project to display.
    let projects = getProjects();
    let initialProject = null;

    if (projects.length === 0) {
        // Create a default project if none are found.
        const defaultProject = new Project("Inbox");
        addProject(defaultProject);
        initialProject = defaultProject;
        console.log("Default 'Inbox' project created.");
    } else {
        // Use the first loaded project as the initial one.
        initialProject = projects[0];
    }

    // Set up UI form handlers.
    setupProjectFormHandler();
    setupTodoFormHandler();

    // Render initial UI based on the determined project.
    if (initialProject) {
        const selectedProject = getProject(initialProject.id); // Ensures current project in app.js is set.
        renderProjectList(getProjects());
        if (selectedProject) {
            renderTodoList(selectedProject.todos);
        } else {
            renderTodoList([]);
        }
    } else {
        renderProjectList([]);
        renderTodoList([]);
    }
});
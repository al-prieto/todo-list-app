// app.js
/**
 * @fileoverview Manages the core application logic and data model for the ToDo application.
 * This module handles the creation, modification, and retrieval of projects and ToDos.
 * It acts as the single source of truth for the application's data.
 */

// Import the Todo class for creating new ToDo objects.
import Todo from "./todo.js";
// Import the Project class for creating new Project objects.
// (You'll need to import this if you use 'new Project()' directly in app.js,
// e.g., for creating a default project. It's good practice to import it here).
import Project from "./project.js"; 

/**
 * @type {Array<Object>} projects - The main array holding all project objects.
 * Each project object contains its own array of ToDo objects.
 */
let projects = [];

/**
 * @type {number|null} currentProjectId - The ID of the currently selected project.
 * Used to determine which project's ToDos are being displayed or modified.
 */
let currentProjectId = null;

/**
 * Saves the current projects array to localStorage.
 * The array is stringified to JSON before saving.
 */
function saveProjectsToLocalStorage() {
    try {
        localStorage.setItem('todoAppProjects', JSON.stringify(projects));
        console.log("Projects saved to localStorage successfully!");
    } catch (e) {
        console.error("Error saving projects to localStorage:", e);
        // Optionally, inform the user if localStorage is full or unavailable
        alert("Could not save your data. Your browser's local storage might be full or disabled.");
    }
}

/**
 * Loads projects from localStorage and reconstructs them into the 'projects' array.
 * This function also handles the re-instantiation of Todo objects,
 * as JSON.parse does not automatically restore class methods.
 * @returns {Array<Object>} The loaded projects array, or an empty array if no data found.
 */
function loadProjectsFromLocalStorage() {
    const storedProjectsJSON = localStorage.getItem('todoAppProjects');
    if (storedProjectsJSON) {
        try {
            const parsedProjects = JSON.parse(storedProjectsJSON);

            // IMPORTANT: When you parse JSON, you lose the class methods (like todo.toggleComplete()).
            // We need to re-instantiate the Todo objects.
            const hydratedProjects = parsedProjects.map(projectData => {
                // Recreate a new Project instance from stored data
                const newProject = new Project(projectData.name, projectData.id); // Use Project class constructor

                // Re-instantiate each todo as a Todo object using your Todo class
                if (projectData.todos && Array.isArray(projectData.todos)) {
                    newProject.todos = projectData.todos.map(todoData => {
                        return new Todo(
                            todoData.title,
                            todoData.description,
                            todoData.dueDate,
                            todoData.priority,
                            todoData.notes,
                            todoData.completed,
                            todoData.id,
                            todoData.projectId // Make sure to pass projectId if your Todo constructor handles it
                        );
                    });
                }
                return newProject;
            });

            // Assign the loaded and hydrated projects back to your global 'projects' array.
            projects = hydratedProjects;
            console.log("Projects loaded from localStorage successfully!");

            // After loading, ensure currentProjectId is set to a valid project ID
            // if there are projects. Default to the first one.
            if (projects.length > 0) {
                currentProjectId = projects[0].id;
            } else {
                currentProjectId = null;
            }

        } catch (e) {
            console.error("Error parsing projects from localStorage:", e);
            // If there's an error parsing, clear localStorage to prevent loop.
            localStorage.removeItem('todoAppProjects');
            projects = []; // Reset projects to empty array
            currentProjectId = null;
            alert("Corrupted data found in local storage. Your data has been reset.");
        }
    } else {
        console.log("No projects found in localStorage. Starting with empty state.");
        projects = []; // Ensure projects array is empty if nothing in storage.
        currentProjectId = null;
    }
    return projects; // Return the (now populated) projects array
}

/**
 * Adds a new project to the application's project list.
 * @param {Object} project - The project object to add.
 */
function addProject(project) {
    projects.push(project);
    saveProjectsToLocalStorage();
}

/**
 * Removes a project from the application's project list by its ID.
 * If the removed project was the currently selected one, it attempts to select
 * the first available project, or sets currentProjectId to null if no projects remain.
 * @param {number} projectId - The ID of the project to remove.
 * @returns {Object|null} The removed project object, or null if not found.
 */
function removeProject(projectId) {
    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex !== -1) {
        const removedProject = projects.splice(projectIndex, 1)[0];
        if (currentProjectId === projectId) {
            currentProjectId = projects.length > 0 ? projects[0].id : null;
        }
        console.log(`Project with ID ${projectId} removed.`);
        saveProjectsToLocalStorage();
        return removedProject;
    } else {
        console.warn(`Attempted to remove project with ID ${projectId}, but it was not found.`);
        return null;
    }
}

/**
 * Retrieves a project by its ID.
 * This function also updates the `currentProjectId` to the ID of the found project.
 * @param {number} projectId - The ID of the project to retrieve.
 * @returns {Object|null} The found project object, or null if not found.
 */
function getProject(projectId) {
    if (projectId === null && currentProjectId !== null) {
        const foundCurrentProject = projects.find((p) => p.id === currentProjectId);
        if (foundCurrentProject) {
            return foundCurrentProject;
        } else {
            currentProjectId = null;
            console.warn("Current project not found, resetting currentProjectId.");
            return null;
        }
    }

    const foundProject = projects.find((p) => p.id === projectId);

    if (foundProject) {
        currentProjectId = projectId;
        return foundProject;
    } else {
        console.warn(`Project with ID ${projectId} not found.`);
        return null;
    }
}

/**
 * Adds a new ToDo item to a specific project.
 * @param {Object} todo - The ToDo object to add.
 * @param {number} projectId - The ID of the project to add the ToDo to.
 */
function addTodoProject(todo, projectId) {
    const project = getProject(projectId);
    if (project) {
        project.todos.push(todo);
        console.log(`ToDo "${todo.title}" added to project "${project.name}".`);
        saveProjectsToLocalStorage();
    } else {
        console.warn(`Could not add ToDo. Project with ID ${projectId} not found.`);
    }
}

/**
 * Removes a ToDo item from a specific project.
 * @param {number} todoId - The ID of the ToDo to remove.
 * @param {number} projectId - The ID of the project from which to remove the ToDo.
 */
function removeTodo(todoId, projectId) {
    const project = getProject(projectId);
    if (!project) {
        console.warn(`Project with ID ${projectId} not found. Cannot remove ToDo.`);
        return;
    }
    const initialTodosCount = project.todos.length;
    project.todos = project.todos.filter((t) => t.id !== todoId);

    if (project.todos.length < initialTodosCount) {
        console.log(`ToDo with ID ${todoId} deleted from project "${project.name}".`);
        saveProjectsToLocalStorage();
    } else {
        console.warn(`ToDo with ID ${todoId} not found in project "${project.name}".`);
    }
}

/**
 * Toggles the completion status of a specific ToDo item.
 * @param {number} todoId - The ID of the ToDo to toggle.
 * @param {number} projectId - The ID of the project containing the ToDo.
 */
function toggleComplete(todoId, projectId) {
    const project = getProject(projectId);
    if (!project) {
        console.warn(`Project with ID ${projectId} not found. Cannot toggle ToDo completion.`);
        return;
    }
    const todo = project.todos.find((t) => t.id === todoId);
    if (!todo) {
        console.warn(`ToDo with ID ${todoId} not found in project "${project.name}".`);
        return;
    }
    todo.toggleComplete(); // Call the method on the ToDo object itself.
    console.log(`ToDo "${todo.title}" completion status toggled to: ${todo.completed}.`);
    saveProjectsToLocalStorage();
}

/**
 * Renames an existing project.
 * @param {number} projectId - The ID of the project to rename.
 * @param {string} newName - The new name for the project.
 * @returns {Object|null} The updated project object, or null if not found.
 */
function renameProject(projectId, newName) {
    const projectToRename = projects.find(p => p.id === projectId);
    if (projectToRename) {
        projectToRename.name = newName.trim(); // Ensure no leading/trailing whitespace.
        console.log(`Project ID: ${projectId} renamed to: "${newName}".`);
        saveProjectsToLocalStorage();
        return projectToRename;
    }
    console.warn(`Project with ID ${projectId} not found for renaming.`);
    return null;
}

/**
 * Returns the entire list of projects.
 * @returns {Array<Object>} An array containing all project objects.
 */
function getProjects() {
    return projects;
}

/**
 * Retrieves the currently selected project.
 * If no project is explicitly selected or the selected project no longer exists,
 * it attempts to set and return the first project in the list as current.
 * @returns {Object|null} The current project object, or null if no projects exist.
 */
function getCurrentProject() {
    if (currentProjectId === null || !projects.find(p => p.id === currentProjectId)) {
        if (projects.length > 0) {
            currentProjectId = projects[0].id;
            return projects[0];
        }
        return null;
    }
    return getProject(currentProjectId);
}


// Export all functions that need to be accessible from other modules.
export {
    addProject,
    removeProject,
    getProject,
    addTodoProject,
    removeTodo,
    toggleComplete,
    renameProject,
    getProjects,
    getCurrentProject,
    loadProjectsFromLocalStorage // Only loadProjectsFromLocalStorage should be exported for loading
};
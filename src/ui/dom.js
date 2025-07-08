// dom.js
/**
 * @fileoverview Manages all direct DOM manipulation and rendering for the ToDo application.
 * This module is responsible for creating, updating, and removing HTML elements based on application state.
 */

// Import necessary functions from the application logic module.
// 'renameProject' is now correctly imported for renaming functionality.
import { getCurrentProject, getProject, removeProject, removeTodo, toggleComplete, getProjects, renameProject } from "../modules/app.js";

/**
 * Renders the list of projects in the sidebar.
 * This function clears the existing list and re-renders all projects.
 * @param {Array<Object>} projects - An array of project objects to display.
 */
export function renderProjectList(projects) {
    const projectListContainer = document.getElementById('project-list');
    // Clear previous project list to prevent duplicates on re-render.
    projectListContainer.innerHTML = '';

    // Determine the currently active project's ID to apply 'active' class.
    const currentActiveProject = getCurrentProject();
    const currentActiveProjectId = currentActiveProject ? currentActiveProject.id : null;

    // Handle case where there are no projects.
    if (projects.length === 0) {
        const noProjectsMessage = document.createElement('p');
        noProjectsMessage.textContent = "No projects available. Please add a new one.";
        projectListContainer.appendChild(noProjectsMessage);
        // Ensure todo list is also empty if no projects
        renderTodoList([]);
        return;
    }

    // Iterate over each project to create its corresponding DOM element.
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        // Store the project ID as a data attribute for easy retrieval during interactions.
        projectElement.dataset.id = project.id;
        projectElement.classList.add('project-item'); // Base class for styling.

        // Create a span to hold the project name, allowing for in-place editing later.
        const projectNameDisplay = document.createElement('span');
        projectNameDisplay.classList.add('project-name-display');
        projectNameDisplay.textContent = project.name;
        projectElement.appendChild(projectNameDisplay); // Append the span to the projectElement

        // Apply 'active' class if this project is the currently selected one.
        if (project.id === currentActiveProjectId) {
            projectElement.classList.add('active');
        }

        // --- Project Name Edit Functionality ---
        // This listener allows users to click on the project name to rename it.
        projectNameDisplay.addEventListener('click', (e) => {
            // Stop propagation to prevent the parent projectElement's click listener (for selection) from firing
            // when we click on the name display to edit.
            e.stopPropagation();

            // Hide the name display span
            projectNameDisplay.style.display = 'none';

            // Create the input field for renaming
            const projectRenameInput = document.createElement('input');
            projectRenameInput.type = 'text';
            projectRenameInput.classList.add('project-rename-input');
            projectRenameInput.value = project.name; // Pre-fill with current project name

            // Insert input field into the project element before the hidden name display.
            // Using insertBefore ensures the input appears at the correct position.
            projectElement.insertBefore(projectRenameInput, projectNameDisplay);
            projectRenameInput.focus(); // Automatically focus the input for immediate typing.

            // --- Flag to prevent double execution from blur/keyup ---
            // This flag ensures the save/cleanup logic runs only once,
            // as both 'blur' and 'Enter' keyup can trigger it.
            let isActionHandled = false;

            /**
             * Handles cleanup after save/cancel, including removing input and re-rendering.
             * Prevents double execution if multiple events fire rapidly.
             */
            const cleanupAndRender = () => {
                if (isActionHandled) return; // If action already handled, exit.
                isActionHandled = true; // Mark action as handled.

                // Remove event listeners to prevent memory leaks and further accidental calls
                // from an input that's about to be removed from the DOM.
                projectRenameInput.removeEventListener('blur', handleBlur);
                projectRenameInput.removeEventListener('keyup', handleKeyUp);

                // Clean up: remove input and show name display again.
                // Check if the input is still a child before attempting to remove it.
                if (projectElement.contains(projectRenameInput)) {
                    projectElement.removeChild(projectRenameInput);
                }
                projectNameDisplay.style.display = 'inline'; // Or 'block', depending on your CSS display for span

                // Re-render the project list to update the name in the UI.
                // This also ensures the correct 'active' project is highlighted.
                renderProjectList(getProjects());

                // If the project that was just renamed is also the currently selected project,
                // re-render its todo list to update any project name display within the todo section (if applicable).
                const currentProj = getCurrentProject();
                if (currentProj && currentProj.id === project.id) {
                    renderTodoList(currentProj.todos);
                }
            };

            /**
             * Handles the logic for saving the new project name.
             */
            const saveRename = () => {
                const newProjectName = projectRenameInput.value.trim();

                // Validate new name: must not be empty and must be different from current name.
                // If validation fails or user cancels implicitly (clicks away without changing), revert.
                if (newProjectName === '' || newProjectName === project.name) {
                    console.log("Project rename cancelled or name is unchanged/empty.");
                } else {
                    // Call the rename function from app.js to update the data model.
                    renameProject(project.id, newProjectName);
                    console.log(`Project ID: ${project.id} renamed to: "${newProjectName}".`);
                }
                cleanupAndRender(); // Always perform cleanup after attempting save, regardless of validation.
            };

            // --- Define event handlers for blur and keyup ---
            const handleBlur = () => {
                saveRename();
            };

            const handleKeyUp = (keyEvent) => {
                if (keyEvent.key === 'Enter') {
                    saveRename();
                    keyEvent.preventDefault(); // Prevent default 'Enter' behavior (e.g., form submission).
                } else if (keyEvent.key === 'Escape') { // Optional: Allow 'Escape' key to cancel editing.
                    console.log("Project rename cancelled by Escape key.");
                    cleanupAndRender();
                }
            };

            // Attach event listeners to the input field.
            projectRenameInput.addEventListener('blur', handleBlur);
            projectRenameInput.addEventListener('keyup', handleKeyUp);
        });


        // --- Project Delete Button ---
        const deleteProjectButton = document.createElement('button');
        deleteProjectButton.textContent = "Delete";
        deleteProjectButton.classList.add('delete-project-btn');

        // Add event listener for the delete button.
        deleteProjectButton.addEventListener('click', (e) => {
            // Stop propagation to prevent the parent projectElement's click listener from firing.
            e.stopPropagation();

            const projectIdToDelete = project.id;

            // Confirm deletion to prevent accidental data loss.
            if (!confirm(`Are you sure you want to delete project "${project.name}" and all its tasks? This action cannot be undone.`)) {
                return; // User cancelled, exit function.
            }

            // Remove the project from the application's data model.
            // app.js handles updating the current project if the deleted one was active.
            removeProject(projectIdToDelete);

            // Re-render the UI based on the updated application state.
            // 1. Re-render the project list in the sidebar.
            renderProjectList(getProjects());

            // 2. Update the ToDo list based on the new current project.
            const newCurrentProject = getCurrentProject(); // Get the project now designated as current.
            if (newCurrentProject) {
                renderTodoList(newCurrentProject.todos);
            } else {
                // If no projects remain (e.g., all were deleted), clear the todo list.
                renderTodoList([]);
            }
        });

        // Append the delete button to the project element.
        projectElement.appendChild(deleteProjectButton);

        // --- Project Selection Click Listener ---
        // This listener handles selecting a project to view its ToDos.
        projectElement.addEventListener("click", () => {
            // Remove 'active' class from previously selected project, if any.
            const previouslyActive = document.querySelector('.project-item.active');
            if (previouslyActive) {
                previouslyActive.classList.remove('active');
            }

            // Add 'active' class to the newly clicked project.
            projectElement.classList.add('active');

            const id = projectElement.dataset.id;
            // Retrieve the selected project from app.js; this also sets it as the current project in app.js.
            const selectedProject = getProject(Number(id));

            if (selectedProject) {
                // Render the ToDo list for the selected project.
                renderTodoList(selectedProject.todos);
                console.log("Project selected:", selectedProject.name);
            } else {
                // Fallback if project is not found (shouldn't happen under normal operation).
                console.warn("Project not found when clicking.");
                renderTodoList([]); // Clear todos if project not found.
            }
        });

        // Finally, append the fully constructed project element to the list container.
        projectListContainer.appendChild(projectElement);
    });
}

/**
 * Renders the list of ToDos for the currently selected project.
 * This function clears the existing list and re-renders all ToDos.
 * @param {Array<Object>} todos - An array of todo objects to display.
 */
export function renderTodoList(todos) {
    const todoListContainer = document.getElementById('todo-list');
    // Clear previous ToDo list to prevent duplicates on re-render.
    todoListContainer.innerHTML = '';

    // Display a message if there are no ToDos for the current project.
    if (todos.length === 0) {
        const noTodosMessage = document.createElement('p');
        noTodosMessage.textContent = "No tasks yet for this project. Add one!";
        todoListContainer.appendChild(noTodosMessage);
        return;
    }

    // Iterate over each todo to create its corresponding DOM element.
    todos.forEach(todo => {
        const todoElement = document.createElement('li');
        todoElement.classList.add('todo-item');
        // Store the ToDo ID as a data attribute.
        todoElement.dataset.id = todo.id;

         if (todo.priority === 'low') {
        todoElement.classList.add('todo-priority-low');
    } else if (todo.priority === 'medium') {
        todoElement.classList.add('todo-priority-medium');
    } else if (todo.priority === 'high') {
        todoElement.classList.add('todo-priority-high');
    }

        // --- ToDo Summary Section ---
        // Contains the basic visible information of the ToDo.
        const todoSummary = document.createElement('div');
        todoSummary.classList.add('todo-summary');

        // --- ToDo Details Section ---
        // Contains the expanded details (description, notes, edit button). Hidden by default.
        const todoDetails = document.createElement('div');
        todoDetails.classList.add('todo-details');
        todoDetails.style.display = 'none'; // Initially hidden.

        // Add click listener to the summary to toggle details visibility.
        todoSummary.addEventListener('click', (e) => {
            // Prevent event from bubbling up if click is on checkbox, delete, or edit button within summary.
            if (e.target.type === 'checkbox' || e.target.classList.contains('delete-todo-btn') || e.target.classList.contains('edit-todo-btn')) {
                return;
            }

            // Toggle visibility of the details section.
            if (todoDetails.style.display === 'none') {
                todoDetails.style.display = 'block';
            } else {
                todoDetails.style.display = 'none';
            }
        });

        // --- ToDo Title ---
        const todoTitle = document.createElement('h3');
        todoTitle.innerText = todo.title;
        todoSummary.appendChild(todoTitle);

        // --- ToDo Due Date ---
        const todoDueDate = document.createElement('p');
        todoDueDate.innerText = `Due: ${todo.dueDate}`;
        todoSummary.appendChild(todoDueDate);

        // --- ToDo Priority ---
        const todoPriority = document.createElement('p');
        todoPriority.innerText = `Priority: ${todo.priority}`;
        todoSummary.appendChild(todoPriority);

        // --- ToDo Completed Checkbox ---
        const todoCompletedLabel = document.createElement('label');
        todoCompletedLabel.textContent = 'Completed: ';
        const todoCompletedInput = document.createElement('input');
        todoCompletedInput.type = 'checkbox';
        todoCompletedInput.checked = todo.completed;
        todoCompletedInput.addEventListener('change', () => {
            const currentProject = getCurrentProject();
            if (currentProject) {
                toggleComplete(todo.id, currentProject.id);
                // No re-render needed here if only styling is based on checkbox state.
                // If the todo list order/filtering changes based on completion, then renderTodoList(currentProject.todos); would be needed.
            }
        });
        todoCompletedLabel.appendChild(todoCompletedInput);
        todoSummary.appendChild(todoCompletedLabel);

        // --- ToDo Description (in details section) ---
        const todoDescription = document.createElement('p');
        todoDescription.innerText = `Description: ${todo.description || 'N/A'}`; // Add N/A for empty description
        todoDetails.appendChild(todoDescription);

        // --- ToDo Notes (in details section) ---
        const todoNotes = document.createElement('p');
        todoNotes.innerText = `Notes: ${todo.notes || 'N/A'}`; // Add N/A for empty notes
        todoDetails.appendChild(todoNotes);

        // --- ToDo Delete Button ---
        const deleteButton = document.createElement('button');
        deleteButton.innerText = "Delete";
        deleteButton.classList.add('delete-todo-btn');
        deleteButton.addEventListener('click', () => {
            const currentProject = getCurrentProject(); // Get the current project context for deletion.
            if (currentProject) {
                removeTodo(todo.id, currentProject.id); // Remove todo from app's data model.
                renderTodoList(currentProject.todos); // Re-render the todo list to reflect changes.
            } else {
                console.warn("No current project selected to delete todo from.");
            }
        });

        // --- ToDo Edit Button ---
        // This button will trigger the inline edit form.
        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.classList.add('edit-todo-btn');

        // Add event listener for the edit button.
        editButton.addEventListener('click', () => {
            // Hide the existing summary and details views, and the delete button.
            todoSummary.style.display = 'none';
            todoDetails.style.display = 'none';
            deleteButton.style.display = 'none';
            editButton.style.display = 'none'; // Hide the edit button itself during editing

            // Create the edit form container.
            const editForm = document.createElement('div');
            editForm.classList.add('todo-edit-form');

            // --- Form Fields ---
            // Title Input
            const titleLabel = document.createElement('label');
            titleLabel.textContent = 'Title: ';
            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.value = todo.title;
            editForm.appendChild(titleLabel);
            editForm.appendChild(titleInput);
            editForm.appendChild(document.createElement('br'));

            // Due Date Input
            const dateLabel = document.createElement('label');
            dateLabel.textContent = 'Due Date: ';
            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.value = todo.dueDate;
            editForm.appendChild(dateLabel);
            editForm.appendChild(dateInput);
            editForm.appendChild(document.createElement('br'));

            // Description Textarea
            const descLabel = document.createElement('label');
            descLabel.textContent = 'Description: ';
            const descInput = document.createElement('textarea');
            descInput.value = todo.description;
            editForm.appendChild(descLabel);
            editForm.appendChild(descInput);
            editForm.appendChild(document.createElement('br'));

            // Notes Textarea
            const notesLabel = document.createElement('label');
            notesLabel.textContent = 'Notes: ';
            const notesInput = document.createElement('textarea');
            notesInput.value = todo.notes;
            editForm.appendChild(notesLabel);
            editForm.appendChild(notesInput);
            editForm.appendChild(document.createElement('br'));

            // Priority Select
            const prioritySelectLabel = document.createElement('label');
            prioritySelectLabel.textContent = 'Priority: ';
            const prioritySelect = document.createElement('select');

            const priorities = ['low', 'medium', 'high'];
            priorities.forEach(p => {
                const option = document.createElement('option');
                option.value = p;
                option.textContent = p.charAt(0).toUpperCase() + p.slice(1);
                if (p === todo.priority) {
                    option.selected = true; // Pre-select current priority.
                }
                prioritySelect.appendChild(option);
            });
            editForm.appendChild(prioritySelectLabel);
            editForm.appendChild(prioritySelect);
            editForm.appendChild(document.createElement('br'));

            // --- Save Button ---
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.classList.add('save-todo-btn'); // Add a class for styling/identification
            saveButton.addEventListener('click', () => {
                // 1. Retrieve new values from form inputs.
                const newTitle = titleInput.value.trim();
                const newDescription = descInput.value.trim();
                const newDueDate = dateInput.value;
                const newPriority = prioritySelect.value;
                const newNotes = notesInput.value.trim();

                // 2. Update the 'todo' object in memory.
                // Note: In a production app, you might have an `updateTodo` function in app.js
                // that takes the todo ID and an object of new properties, then updates and persists.
                todo.title = newTitle;
                todo.description = newDescription;
                todo.dueDate = newDueDate;
                todo.priority = newPriority;
                todo.notes = newNotes;

                // 3. Re-render the ToDo list to reflect changes.
                const currentProject = getCurrentProject();
                if (currentProject) {
                    renderTodoList(currentProject.todos); // This re-renders the entire list, effectively removing the form.
                }

                console.log("Saving changes for todo:", todo.title);
            });
            editForm.appendChild(saveButton);

            // --- Cancel Button ---
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.classList.add('cancel-todo-btn'); // Add a class
            cancelButton.addEventListener('click', () => {
                // Remove the edit form.
                if (todoElement.contains(editForm)) { // Check if it's still a child before removing
                    todoElement.removeChild(editForm);
                }
                // Show the original summary, details, and delete/edit buttons again.
                todoSummary.style.display = 'block';
                todoDetails.style.display = 'block'; // Re-display details
                deleteButton.style.display = 'block';
                editButton.style.display = 'block'; // Show the edit button again
                console.log("Editing cancelled for todo:", todo.title);
            });
            editForm.appendChild(cancelButton);

            // Append the edit form to the todo element.
            todoElement.appendChild(editForm);
        });

        // --- Append all main sections to the todoElement ---
        // Ensure proper order for layout (summary first, then details, then always-visible delete button)
        todoElement.appendChild(todoSummary);
        todoElement.appendChild(todoDetails);
        todoElement.appendChild(deleteButton);
        // The edit button lives within todoDetails, so it's not appended directly to todoElement here.
        todoDetails.appendChild(editButton); // Make sure edit button is part of the details section

        // Finally, append the complete todo element to the main todo list container.
        todoListContainer.appendChild(todoElement);
    });
}
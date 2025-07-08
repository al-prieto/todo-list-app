// todo.js

export default class Todo {
  /**
   * Represents a single ToDo item.
   * @param {string} title - The title of the ToDo.
   * @param {string} description - A detailed description of the ToDo.
   * @param {string} dueDate - The due date of the ToDo (e.g., 'YYYY-MM-DD').
   * @param {string} [priority="medium"] - The priority level (e.g., "low", "medium", "high").
   * @param {string} [notes=""] - Additional notes for the ToDo.
   * @param {boolean} [completed=false] - The completion status of the ToDo.
   * @param {number} [id=Date.now()] - A unique identifier for the ToDo. Automatically generated if not provided.
   * @param {number} projectId - The ID of the project this ToDo belongs to.
   */
  constructor(
    title,
    description,
    dueDate,
    priority = "medium",
    notes = "",
    completed = false,
    id = Date.now(), // Allow existing ID to be passed for loaded Todos
    projectId
  ) {
    this.id = id; // Use provided ID for loaded Todos, or generate new one
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.notes = notes;
    this.completed = completed;
    this.projectId = projectId; // Assign the projectId
  }

  /**
   * Toggles the completion status of the ToDo item.
   */
  toggleComplete() {
    this.completed = !this.completed;
  }
}
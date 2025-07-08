// project.js

export default class Project {
  /**
   * Represents a project that contains a list of ToDo items.
   * @param {string} name - The name of the project.
   * @param {number} [id=Date.now()] - A unique identifier for the project. Generated if not provided.
   */
  constructor(name, id = Date.now()) { // Allow existing ID for loaded projects
    this.id = id; // Use provided ID or generate new one
    this.name = name;
    this.todos = []; // Initialize with an empty array for ToDo items
  }

  /**
   * Adds a ToDo item to the project's list.
   * @param {Object} todo - The ToDo item object to add.
   */
  addTodo(todo) {
    this.todos.push(todo);
  }

  /**
   * Removes a ToDo item from the project's list by its ID.
   * @param {number} id - The ID of the ToDo item to remove.
   */
  removeTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id);
  }
}
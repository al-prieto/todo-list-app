export default class Todo {
  constructor(
    title,
    description,
    dueDate,
    priority = "medium",
    notes = "",
    completed = false
  ) {
    this.id = Date.now();
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.notes = notes;
    this.completed = completed;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }
}

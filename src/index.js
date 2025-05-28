import "./styles/styles.css";
import Todo from "./modules/todo.js";
import Project from "./modules/project.js";

const testTodo = new Todo(
  "Buy milk",
  "Don't forget the lactores-free one",
  "2025-06-01",
  "high",
  "default"
);

console.log(testTodo);

const testProject = new Project("Grocery");

console.log(testProject);

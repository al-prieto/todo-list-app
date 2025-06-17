import "./styles/styles.css";
import Todo from "./modules/todo.js";
import Project from "./modules/project.js";
import { addProject, addTodoProject } from "./modules/app.js";
import { renderTodoList } from "./ui/dom.js";

const testTodo = new Todo(
  "Buy milk",
  "Don't forget the lactose-free one",
  "2025-06-01",
  "high",
  "default"
);

console.log(testTodo);

const testProject = new Project("Growth");

addProject(testProject);

console.log(testProject);

const testAddTodoProject = new Todo(
  "GSAP Project",
  "Bring some projects inspiration",
  "2025-05-31",
  "high",
  "default"
);

addTodoProject(testAddTodoProject, testProject.id);

console.log("Look at me ", testProject);

const mockTodos = [testTodo, testAddTodoProject];

renderTodoList(mockTodos);
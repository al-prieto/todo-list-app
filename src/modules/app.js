import Todo from "./todo.js";

let projects = [];
let currentProjectId = null;

function addProject(project) {
  projects.push(project);
}

function removeProject(projectId) {
  let index = projects.findIndex((e) => e.id === projectId);
  if (index !== -1) {
    projects.splice(index, 1);
  }
}

function getProject(projectId) {
  const foundProject = projects.find((p) => p.id === projectId);

  if (foundProject) {
    currentProjectId = projectId;
    return foundProject;
  } else {
    console.warn("Project not found.");
    return null;
  }
}

function addTodoProject(todo, projectId) {
  const project = getProject(projectId);
  if (project) {
    project.todos.push(todo);
    console.log("Todo added:", todo);
  } else {
    console.warn("Could not add todo. Project not found.");
  }
}

function removeTodo(todoId, projectId) {
  const project = getProject(projectId);
  if (project) {
    const index = project.todos.findIndex((e) => e.id === todoId);
    if (index !== -1) {
      project.todos.splice(index, 1);
      console.log("Todo deleted");
    }
  } else {
    console.warn("Todo not found in project.");
  }
}

function toggleComplete(todoId, projectId) {
  const project = getProject(projectId);
  if (!project) {
    console.warn("Project not found.");
    return;
  }
  const todo = project.todos.find((t) => t.id === todoId);
  if (!todo) {
    console.warn("Todo not found.");
    return;
  }
  todo.toggleComplete();
  console.log("Todo completion status toggled.");
}

export {
  addProject,
  removeProject,
  getProject,
  addTodoProject,
  removeTodo,
  toggleComplete,
};

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

export { addProject, removeProject, getProject, addTodoProject };

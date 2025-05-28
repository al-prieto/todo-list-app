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

export { addProject, removeProject, getProject };

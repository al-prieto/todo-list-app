export function renderProjectList(projects) {
  const projectListContainer = document.getElementById('project-list');
  projectListContainer.innerHTML = '';


  projects.forEach(project => {
    const projectElement = document.createElement('div');
    projectElement.textContent = project.name;
    projectListContainer.appendChild(projectElement);
  });
}

export function renderTodoList(todos) {
  const todoListContainer = document.getElementById('todo-list');
  todoListContainer.innerHTML = '';

  todos.forEach(todo => {
    const todoElement = document.createElement('li');
    todoElement.innerText = todo.title;

  })
}

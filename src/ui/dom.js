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
    const todoTitle = document.createElement('h3');
    todoTitle.innerText = todo.title;
    todoElement.appendChild(todoTitle);
    const todoDueDate = document.createElement('p');
    todoDueDate.innerText = todo.dueDate;
    todoElement.appendChild(todoDueDate);
    const todoPriority = document.createElement('p');
    todoPriority.innerText = todo.priority;
    todoElement.appendChild(todoPriority);

    todoListContainer.appendChild(todoElement)

    


  })
}

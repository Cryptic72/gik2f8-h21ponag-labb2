todoForm.title.addEventListener('keyup', (e) => validateField(e.target));
todoForm.title.addEventListener('blur', (e) => validateField(e.target));
todoForm.description.addEventListener('input', (e) => validateField(e.target));
todoForm.description.addEventListener('blur', (e) => validateField(e.target));
todoForm.dueDate.addEventListener('input', (e) => validateField(e.target));
todoForm.dueDate.addEventListener('blur', (e) => validateField(e.target));

todoForm.addEventListener('submit', onSubmit);

const todoListElement = document.getElementById('todoList');

let titleValid = true;
let descriptionValid = true;
let dueDateValid = true;

const api = new Api('http://localhost:5000/tasks');

function validateField(field) {
  const { name, value } = field;

  let = validationMessage = '';

  switch (name) {
    case 'title': {
      if (value.length < 2) {
        titleValid = false;
        validationMessage = "Fältet 'Titel' måste innehålla minst 2 tecken.";
      } else if (value.length > 100) {
        titleValid = false;
        validationMessage = "Fältet 'Titel' får inte innehålla mer än 100 tecken.";
      } else {
        titleValid = true;
      }
      break;
    }
    case 'description': {
      if (value.length > 500) {
        descriptionValid = false;
        validationMessage = "Fältet 'Beskrvining' får inte innehålla mer än 500 tecken.";
      } else {
        descriptionValid = true;
      }
      break;
    }
    case 'dueDate': {
      if (value.length === 0) {
        dueDateValid = false;
        validationMessage = "Fältet 'Slutförd senast' är obligatorisk.";
      } else {
        dueDateValid = true;
      }
      break;
    }
  }

  field.previousElementSibling.innerText = validationMessage;
  field.previousElementSibling.classList.remove('hidden');
}

function onSubmit(e) {
  e.preventDefault();
  if (titleValid && descriptionValid && dueDateValid) {
    console.log('Submit');
    saveTask();
  }
}

function saveTask() {
  const task = {
    title: todoForm.title.value,
    description: todoForm.description.value,
    dueDate: todoForm.dueDate.value,
    completed: false
  };

  api.create(task).then((task) => {
    if (task) {
      renderList();
    }
  });
}

// Added code to RenderList() so that the tasks are sorted by date. If a task is marked as completed it is moved to the bottom of the list or back up again if unmarked.

function renderList() {
  const taskList = [];
  console.log('rendering');
  api.getAll().then((tasks) => {
    todoListElement.innerHTML = '';
    if (tasks && tasks.length > 0) {
      tasks.forEach((task) => {
        taskList.push(task);
      });
      taskList.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      for(let i = 0; i < taskList.length; i++){
        if (taskList[i]['completed'] == true) {
          taskList.splice(taskList.length, 1, taskList[i]);
          taskList.splice(i, 1);
        }
      }
      taskList.forEach((task) => {
        todoListElement.insertAdjacentHTML('beforeend', renderTask(task));
      });
    }
  });
}

/* For rendering the tasks in the list on the website. Since rendering of list commences between every call the 
completed status was added as a parameter to make the checkbox remain ticked if it was clicked, otherwise it will untick after clicked. */

function renderTask({ id, title, description, dueDate, completed }) {

  const checkStatus =  completed == true ? "checked" : "";
  const bg = completed == true ? "bg-lime-400 rounded-md" : "";

  // If the task is completed the background is set to lime-400 + rounded and "checked" is added to tag to make checkbox ticked.

  let html = `
    <li class="select-none mt-2 py-2 border-b border-amber-300">
      <div class="flex items-center p-1 ${bg}" id=${id}>
        <h3 class="mb-3 flex-1 text-xl font-bold text-pink-800 uppercase">${title}</h3>
        <div>
          <span>${dueDate}</span>
          <button onclick="deleteTask(${id})" class="inline-block bg-amber-500 text-xs text-amber-900 border border-white px-3 py-1 rounded-md ml-2">Ta bort</button>
          <br>
          <input onclick="completeTask(${id})" type="checkbox" id="completeBox" name="completeBox"${checkStatus}>
          <label for="completedBox">Utförd</label><br>
        </div>
      </div>`;
  description &&
    (html += `
      <p class="ml-8 mt-2 text-xs italic">${description}</p>
  `);
  html += `
    </li>`;

  return html;
}

function deleteTask(id) {
  api.remove(id).then((result) => {
    renderList();
  });
}

// When checkbox is ticked an api call is made.

function completeTask(id) {
  const status = document.getElementById(id).querySelector('#completeBox').checked;
  api.update(id, status);
}

renderList();

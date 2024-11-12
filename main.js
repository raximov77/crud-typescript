"use strict";
const elForm = document.querySelector(".todo-form");
const inputValue = document.querySelector(".todo-input");
const elTodoList = document.querySelector(".todo-list");
const updateModal = document.getElementById('updateModal');
const updateInput = document.getElementById('updateInput');
const saveUpdateBtn = document.getElementById('saveUpdateBtn');
const closeButton = document.querySelector('.close-button');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const clearInputBtn = document.getElementById('clearInputBtn');
const filterBtns = document.querySelectorAll(".filter-btn");
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const modalImageInput = document.getElementById('modalImageInput');
const modalImagePreview = document.getElementById('modalImagePreview');
let todos = JSON.parse(localStorage.getItem("todos") || "[]");
let currentFilter = "all";
let currentEditId = null;
elForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = {
        id: Date.now(),
        todoValue: inputValue.value,
        isCompleted: false,
        imageUrl: imagePreview.querySelector('img') ? imagePreview.querySelector('img').src : null
    };
    todos.push(data);
    saveAndRenderTodos();
    elForm.reset();
    imagePreview.innerHTML = `<i class="fa-solid fa-image"></i>`;
});
function saveAndRenderTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodos();
}
function renderTodos() {
    elTodoList.innerHTML = "";
    const filteredTodos = getFilteredTodos();
    filteredTodos.forEach((item, index) => {
        const elTodoItem = document.createElement("li");
        elTodoItem.className = "flex bg-white p-2 rounded-lg items-center justify-between";
        elTodoItem.innerHTML = `
            <div class="flex items-center">
                <span>${index + 1}.</span>
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="Todo Image" class="w-12 h-12 ml-2 rounded-full object-cover mr-[10px]"/>` : ''}
                <strong class="${item.isCompleted ? 'line-through opacity-60' : ''}">${item.todoValue}</strong>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-[22px] h-[22px] cursor-pointer rounded-full border-[2px] border-black relative" data-id="${item.id}">
                    ${item.isCompleted ? '<div class="absolute inset-[2px] bg-blue-500 rounded-full"></div>' : ''}
                </div>
                <button type="button" class="delete-btn w-[35px] h-[35px] rounded-lg bg-red-500 text-white border-[2px] border-transparent font-semibold hover:bg-transparent hover:text-red-500 hover:border-red-500 duration-300"><i class="fa-solid fa-trash"></i></button>
                <button type="button" class="update-btn w-[35px] h-[35px] rounded-lg bg-blue-500 text-white border-[2px] border-transparent font-semibold hover:bg-transparent hover:text-blue-500 hover:border-blue-500 duration-300"><i class="fa-solid fa-pen"></i></button>
            </div>
        `;
        const toggleCompleteButton = elTodoItem.querySelector(`[data-id="${item.id}"]`);
        const deleteButton = elTodoItem.querySelector('.delete-btn');
        const updateButton = elTodoItem.querySelector('.update-btn');
        toggleCompleteButton.addEventListener('click', () => handleToggleComplete(item.id));
        deleteButton.addEventListener('click', () => handleDeleteTodo(item.id));
        updateButton.addEventListener('click', () => handleUpdateTodo(item.id));
        elTodoList.append(elTodoItem);
    });
    updateCounters();
}
function handleDeleteTodo(id) {
    todos = todos.filter(item => item.id !== id);
    saveAndRenderTodos();
}
function handleUpdateTodo(id) {
    const todo = todos.find(item => item.id === id);
    if (!todo)
        return;
    currentEditId = id;
    updateInput.value = todo.todoValue;
    modalImagePreview.innerHTML = todo.imageUrl ? `<img src="${todo.imageUrl}" alt="Todo Image" />` : `<i class="fa-solid fa-image"></i>`;
    updateModal.classList.remove('hidden');
}
saveUpdateBtn.addEventListener('click', function () {
    if (currentEditId !== null) {
        todos = todos.map(item => {
            if (item.id === currentEditId) {
                item.todoValue = updateInput.value;
                const modalImage = modalImagePreview.querySelector('img');
                item.imageUrl = modalImage ? modalImage.src : null;
            }
            return item;
        });
        currentEditId = null;
        updateInput.value = '';
        updateModal.classList.add('hidden');
        saveAndRenderTodos();
    }
});
closeButton.addEventListener('click', function () {
    updateModal.classList.add('hidden');
    updateInput.value = '';
    modalImagePreview.innerHTML = `<i class="fa-solid fa-image"></i>`;
    currentEditId = null;
});
function handleToggleComplete(id) {
    todos = todos.map(item => {
        if (item.id === id) {
            item.isCompleted = !item.isCompleted;
        }
        return item;
    });
    saveAndRenderTodos();
}
filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        currentFilter = this.dataset.filter || "all";
        renderTodos();
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
function getFilteredTodos() {
    if (currentFilter === "completed") {
        return todos.filter(todo => todo.isCompleted);
    }
    else if (currentFilter === "uncompleted") {
        return todos.filter(todo => !todo.isCompleted);
    }
    else {
        return todos;
    }
}
function updateCounters() {
    document.querySelector('.all-count').textContent = String(todos.length);
    document.querySelector('.completed-count').textContent = String(todos.filter(todo => todo.isCompleted).length);
    document.querySelector('.uncompleted-count').textContent = String(todos.filter(todo => !todo.isCompleted).length);
}
themeToggleBtn.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
});
clearInputBtn.addEventListener('click', function () {
    inputValue.value = '';
});
imageInput.addEventListener('change', function (event) {
    var _a;
    const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            var _a;
            imagePreview.innerHTML = `<img src="${(_a = e.target) === null || _a === void 0 ? void 0 : _a.result}" alt="Todo Image" />`;
        };
        reader.readAsDataURL(file);
    }
    else {
        imagePreview.innerHTML = `<i class="fa-solid fa-image"></i>`;
    }
});
modalImageInput.addEventListener('change', function (event) {
    var _a;
    const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            var _a;
            modalImagePreview.innerHTML = `<img src="${(_a = e.target) === null || _a === void 0 ? void 0 : _a.result}" alt="Todo Image" />`;
        };
        reader.readAsDataURL(file);
    }
    else {
        modalImagePreview.innerHTML = `<i class="fa-solid fa-image"></i>`;
    }
});
renderTodos();

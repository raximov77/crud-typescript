interface Todo {
    id: number;
    todoValue: string;
    isCompleted: boolean;
    imageUrl: string | null;
}

const elForm = document.querySelector(".todo-form") as HTMLFormElement;
const inputValue = document.querySelector(".todo-input") as HTMLInputElement;
const elTodoList = document.querySelector(".todo-list") as HTMLUListElement;
const updateModal = document.getElementById('updateModal') as HTMLDivElement;
const updateInput = document.getElementById('updateInput') as HTMLInputElement;
const saveUpdateBtn = document.getElementById('saveUpdateBtn') as HTMLButtonElement;
const closeButton = document.querySelector('.close-button') as HTMLSpanElement;
const themeToggleBtn = document.getElementById('themeToggleBtn') as HTMLButtonElement;
const clearInputBtn = document.getElementById('clearInputBtn') as HTMLButtonElement;
const filterBtns = document.querySelectorAll(".filter-btn") as NodeListOf<HTMLButtonElement>;
const imageInput = document.getElementById('imageInput') as HTMLInputElement;
const imagePreview = document.getElementById('imagePreview') as HTMLSpanElement;
const modalImageInput = document.getElementById('modalImageInput') as HTMLInputElement;
const modalImagePreview = document.getElementById('modalImagePreview') as HTMLSpanElement;

let todos: Todo[] = JSON.parse(localStorage.getItem("todos") || "[]");
let currentFilter: string = "all";
let currentEditId: number | null = null;

elForm.addEventListener("submit", function (e: Event) {
    e.preventDefault();
    const data: Todo = {
        id: Date.now(),
        todoValue: inputValue.value,
        isCompleted: false,
        imageUrl: imagePreview.querySelector('img') ? (imagePreview.querySelector('img') as HTMLImageElement).src : null
    };
    todos.push(data);
    saveAndRenderTodos();
    elForm.reset();
    imagePreview.innerHTML = `<i class="fa-solid fa-image"></i>`;
});

function saveAndRenderTodos(): void {
    localStorage.setItem("todos", JSON.stringify(todos));
    renderTodos();
}

function renderTodos(): void {
    elTodoList.innerHTML = ""; 
    const filteredTodos: Todo[] = getFilteredTodos();

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

        const toggleCompleteButton = elTodoItem.querySelector(`[data-id="${item.id}"]`) as HTMLDivElement;
        const deleteButton = elTodoItem.querySelector('.delete-btn') as HTMLButtonElement;
        const updateButton = elTodoItem.querySelector('.update-btn') as HTMLButtonElement;

        toggleCompleteButton.addEventListener('click', () => handleToggleComplete(item.id));
        deleteButton.addEventListener('click', () => handleDeleteTodo(item.id));
        updateButton.addEventListener('click', () => handleUpdateTodo(item.id));

        elTodoList.append(elTodoItem);
    });

    updateCounters();
}

function handleDeleteTodo(id: number): void {
    todos = todos.filter(item => item.id !== id);
    saveAndRenderTodos();
}

function handleUpdateTodo(id: number): void {
    const todo = todos.find(item => item.id === id);
    if (!todo) return;
    currentEditId = id;
    updateInput.value = todo.todoValue;
    modalImagePreview.innerHTML = todo.imageUrl ? `<img src="${todo.imageUrl}" alt="Todo Image" />` : `<i class="fa-solid fa-image"></i>`;
    updateModal.classList.remove('hidden');
}

saveUpdateBtn.addEventListener('click', function() {
    if (currentEditId !== null) {
        todos = todos.map(item => {
            if (item.id === currentEditId) {
                item.todoValue = updateInput.value;
                const modalImage = modalImagePreview.querySelector('img') as HTMLImageElement | null;
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

closeButton.addEventListener('click', function() {
    updateModal.classList.add('hidden');
    updateInput.value = '';
    modalImagePreview.innerHTML = `<i class="fa-solid fa-image"></i>`;
    currentEditId = null;
});

function handleToggleComplete(id: number): void {
    todos = todos.map(item => {
        if (item.id === id) {
            item.isCompleted = !item.isCompleted;
        }
        return item;
    });
    saveAndRenderTodos();
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        currentFilter = (this as HTMLButtonElement).dataset.filter || "all";
        renderTodos();
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

function getFilteredTodos(): Todo[] {
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

function updateCounters(): void {
    (document.querySelector('.all-count') as HTMLElement).textContent = String(todos.length);
    (document.querySelector('.completed-count') as HTMLElement).textContent = String(todos.filter(todo => todo.isCompleted).length);
    (document.querySelector('.uncompleted-count') as HTMLElement).textContent = String(todos.filter(todo => !todo.isCompleted).length);
}

themeToggleBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});

clearInputBtn.addEventListener('click', function() {
    inputValue.value = '';
});

imageInput.addEventListener('change', function(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target?.result}" alt="Todo Image" />`;
        }
        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = `<i class="fa-solid fa-image"></i>`;
    }
});

modalImageInput.addEventListener('change', function(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            modalImagePreview.innerHTML = `<img src="${e.target?.result}" alt="Todo Image" />`;
        }
        reader.readAsDataURL(file);
    } else {
        modalImagePreview.innerHTML = `<i class="fa-solid fa-image"></i>`;
    }
});

renderTodos();

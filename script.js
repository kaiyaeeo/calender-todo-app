const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');
const themeStylesheet = document.getElementById('theme-stylesheet');

const backgroundVid = document.querySelector('.background-vid');

const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const selectedDateInput = document.getElementById('selected-date');
const selectedDateDisplay = document.getElementById('selected-date-display');

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');

const addTaskBtn = document.getElementById('add-task-btn');
const todosList = document.getElementById('todos-list');
const todosPlusList = document.getElementById('todos-plus-list');
const toggleExpandBtn = document.getElementById('toggle-expand-btn');

const expandText = document.getElementById('expand-text');
const expandIcon = document.getElementById('expand-icon');

let currentDate = new Date();
let selectedDate = new Date();
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let isExpanded = false;

const init = () => {
    initializeTheme();

    selectedDateInput.value = formatDateForInput(selectedDate);

    updateCalendar();
    updateSelectedDateDisplay();

    renderTodosForSelectedDate();
    renderAllTodos();
    setupEventListener();
}

const setupEventListener = () => {
    themeToggleBtn.addEventListener('click', toggleTheme);

    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });

    selectedDateInput.addEventListener('change', (e) => {
        selectedDate = new Date(e.target.value);
        updateSelectedDateDisplay();
        renderTodosForSelectedDate();
        updateCalendar();
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addTodo();
    });

    toggleExpandBtn.addEventListener('click', toggleExpandAllTodos);

    datesElement.addEventListener('click', (e) => {
        if (e.target.classList.contains('date') && !e.target.classList.contains('inactive')) {
            const day = parseInt(e.target.textContent);
            const month = currentDate.getMonth();
            const year = currentDate.getFullYear();

            selectedDate = new Date(year, month, day);
            selectedDateInput.value = formatDateForInput(selectedDate);

            updateSelectedDateDisplay();
            renderTodosForSelectedDate();
            updateCalendar();
        }
    });
}

const initializeTheme = () => {
    const savedTheme = localStorage.getItem('todoAppTheme');

    if (savedTheme === 'light') {
        switchToLightMode();
    }
    else {
        switchToDarkMode();
    }
}

const toggleTheme = () => {
    const currentTheme = themeStylesheet.getAttribute('href');

    if (currentTheme.includes('darkstyle.css')) {
        switchToLightMode();
        localStorage.setItem('todoAppTheme', 'light');
    }
    else {
        switchToDarkMode();
        localStorage.setItem('todoAppTheme', 'dark');
    }
}

const switchToDarkMode = () => {
    themeStylesheet.setAttribute('href', 'darkstyle.css');
    themeIcon.className = 'fa-solid fa-moon';
    themeText.textContent = 'Dark Mode';

    if (backgroundVid) {
        backgroundVid.style.display = 'block';
        backgroundVid.style.filter = 'brightness(70%)';
    }

    document.body.style.filter.backgroundImage = '';
}

const switchToLightMode = () => {
    themeStylesheet.setAttribute('href', 'lightstyle.css');
    themeIcon.className = 'fa-solid fa-sun';
    themeText.textContent = 'Light Mode';

    if (backgroundVid) {
        backgroundVid.style.display = 'none';
    }

    document.body.style.backgroundImage = 'url(./images/background.jpg)';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundRepeat = 'no-repeat';
}

const toggleExpandAllTodos = () => {
    isExpanded = !isExpanded;
    renderAllTodos();
}

const updateCalendar = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();

    const monthYearString = currentDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
    })
    monthYearElement.textContent = monthYearString;

    let datesHTML = '';

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayIndex; i > 0; i--) {

        datesHTML += `<div class="date inactive">${prevMonthLastDay - i + 1}</div>`;
    }

    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        let activeClass = '';
        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            activeClass = 'active';
        }

        const todayClass = date.toDateString() === new Date().toDateString() ? 'today' : '';

        const hasTodos = todos.some(todo => {
            const todoDate = new Date(todo.date);
            return todoDate.toDateString() === date.toDateString();
        });

        const todosClass = hasTodos ? 'has-todos' : '';
        datesHTML += `<div class="date ${activeClass} ${todayClass} ${todosClass}">${i}</div>`;
    }

    const totalCells = 42;
    const cellsUsed = firstDayIndex + totalDays;
    const remainingCells = totalCells - cellsUsed;

    for (let i = 1; i <= remainingCells; i++) {

        datesHTML += `<div class="date inactive">${i}</div>`;
    }

    datesElement.innerHTML = datesHTML;

}

const updateSelectedDateDisplay = () => {
    if (!selectedDate) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (selectedDate.toDateString() === today.toDateString()) {
        selectedDateDisplay.textContent = 'Today';
    }
    else if (selectedDate.toDateString() === tomorrow.toDateString()) {
        selectedDateDisplay.textContent = 'Tomorrow';
    }
    else {
        selectedDateDisplay.textContent = selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }
}

const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const addTodo = () => {
    const taskText = taskInput.value.trim();
    if (taskText === '') {
        alert('Please enter a task here!');
        return;
    }
    const newTodo = {
        id: Date.now(),
        text: taskText,
        date: selectedDate.toISOString(),
        completed: false
    }
    todos.push(newTodo);
    saveTodos();
    renderTodosForSelectedDate();
    renderAllTodos();
    updateCalendar();

    taskInput.value = '';
    taskInput.focus();
}

const toggleTodo = (id) => {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodosForSelectedDate();
    renderAllTodos();
}

const deleteTodo = (id) => {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodosForSelectedDate();
    renderAllTodos();
    updateCalendar();
}

const saveTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos));
}

const renderTodosForSelectedDate = () => {
    if (!selectedDate) return;

    const selectedDateTodos = todos.filter(todo => {
        const todoDate = new Date(todo.date);
        return todoDate.toDateString() === selectedDate.toDateString()
    });
    if (selectedDateTodos.length === 0) {
        todosList.innerHTML = `<div class="no-todos">No tasks for this date</div>`;
        return;
    }
    todosList.innerHTML = selectedDateTodos.map(todo =>
        `<div class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-info">
                <span class="task-text">${todo.text}</span>
            </div>
            <div class="todo-actions">
                <button class="complete-btn" onclick="toggleTodo(${todo.id})">
                    <i class="fa-solid ${todo.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                </button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>`
    ).join('');
}

const renderAllTodos = () => {
    if (todos.length === 0) {
        todosPlusList.innerHTML = `<div class="no-todos">No tasks yet. Add your first task!</div>`;
        return;
    }
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return new Date(b.date) - new Date(a.date);
    });

    const todosToShow = isExpanded ? sortedTodos : sortedTodos.slice(0, 5);

    todosPlusList.innerHTML = todosToShow.map(todo =>
        `<div class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-info">
                <span class="task-text">${todo.text}</span>
                <span class="task-date">${formatTodoDate(new Date(todo.date))}</span>
            </div>
            <div class="todo-actions">
                <button class="complete-btn" onclick="toggleTodo(${todo.id})">
                    <i class="fa-solid ${todo.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                </button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>`
    ).join('');

    if (expandText && expandIcon) {
        expandText.textContent = isExpanded ? 'Show Less' : `Show All (${todos.length})`;
        expandIcon.className = isExpanded ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
    }
    if (isExpanded) {
        todosPlusList.classList.add('expanded');
    }
    else {
        todosPlusList.classList.remove('expanded');
    }
}

const formatTodoDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    }
    else {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    }
}

document.addEventListener('DOMContentLoaded', init);

window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;




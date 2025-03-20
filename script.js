// LocalStorage Management
let tasks = [];
let categories = ['Work', 'Personal', 'Urgent'];
let currentTheme = 'light';

function saveToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('theme', currentTheme);
}

function loadFromStorage() {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    categories = JSON.parse(localStorage.getItem('categories')) || ['Work', 'Personal', 'Urgent'];
    currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
}

// Theme Management
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    saveToStorage();
}

// Category Management
function initializeCategories() {
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.innerHTML = '<option value="">Category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    renderCategoryList();
}

function openCategoryModal() {
    document.getElementById('categoryModal').style.display = 'flex';
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

function addNewCategory() {
    const input = document.getElementById('newCategory');
    const categoryName = input.value.trim();

    if (categoryName && !categories.includes(categoryName)) {
        categories.push(categoryName);
        saveToStorage();
        initializeCategories();
        input.value = '';
    }
}

function renderCategoryList() {
    const container = document.getElementById('categoryList');
    container.innerHTML = '';

    categories.forEach(category => {
        const chip = document.createElement('div');
        chip.className = 'category-chip';
        chip.innerHTML = `
            ${category}
            <i class="fas fa-times" onclick="removeCategory('${category}')"></i>
        `;
        container.appendChild(chip);
    });
}

function removeCategory(categoryName) {
    if (confirm(`Remove category "${categoryName}"? This won't delete associated tasks.`)) {
        categories = categories.filter(cat => cat !== categoryName);
        saveToStorage();
        initializeCategories();
    }
}

// Task Management
class Task {
    constructor(text, category, dueDate) {
        this.id = Date.now();
        this.text = text;
        this.category = category || 'General';
        this.dueDate = dueDate || null;
        this.completed = false;
        this.createdAt = new Date();

        if (category && !categories.includes(category)) {
            categories.push(category);
            saveToStorage();
            initializeCategories();
        }
    }
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    const category = document.getElementById('categorySelect').value;
    const dueDate = document.getElementById('dueDate').value;

    if (text) {
        tasks.push(new Task(text, category, dueDate));
        saveToStorage();
        renderTasks();
        input.value = '';
    }
}

function toggleComplete(id) {
    const task = tasks.find(task => task.id === id);
    task.completed = !task.completed;
    saveToStorage();
    renderTasks();
}

function deleteTask(id) {
    if (confirm('Delete this task permanently?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveToStorage();
        renderTasks();
    }
}

function updateProgress() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    document.querySelector('.progress-value').textContent = `${progress}%`;
    document.querySelector('.circle').style.background = 
        `conic-gradient(var(--primary) ${progress}%, var(--background) ${progress}% 100%)`;
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const filteredTasks = tasks.filter(task => 
        task.text.toLowerCase().includes(searchQuery)
    );

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleComplete(${task.id})">
            <span class="task-text">${task.text}</span>
            ${task.category ? `<span class="category-tag" style="background: ${getCategoryColor(task.category)}">${task.category}</span>` : ''}
            ${task.dueDate ? `<span class="due-date">${formatDate(task.dueDate)}</span>` : ''}
            <button class="icon-btn" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
        `;
        taskList.appendChild(li);
    });

    updateProgress();
}

// Helpers
function getCategoryColor(category) {
    const colors = {
        'Work': '#6366f1',
        'Personal': '#10b981',
        'Urgent': '#ef4444'
    };
    return colors[category] || '#94a3b8';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Initialization
window.onload = function() {
    loadFromStorage();
    initializeCategories();
    renderTasks();

    document.getElementById('searchInput').addEventListener('input', renderTasks);
    document.getElementById('filterSelect').addEventListener('change', renderTasks);
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
};
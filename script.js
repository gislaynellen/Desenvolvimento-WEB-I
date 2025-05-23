document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    const tasksContainer = document.getElementById('tasksContainer');
    const cancelBtn = document.getElementById('cancelBtn');
    const filterSelect = document.getElementById('filter');
    
    let tasks = [];
    let editingTaskId = null;
    
    renderTasks();
    
    taskForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
    filterSelect.addEventListener('change', renderTasks);
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const taskDate = document.getElementById('taskDate').value;
        const comment = document.getElementById('comment').value;
        const priority = document.querySelector('input[name="priority"]:checked').value;
        const notification = document.querySelector('input[name="notification"]:checked').value;
        const taskId = document.getElementById('taskId').value;
        
        const task = {
            id: taskId || Date.now().toString(),
            title,
            taskDate,
            comment,
            priority,
            notification,
            creationDate: new Date().toISOString()
        };
        
        if (editingTaskId) {
            const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
            tasks[taskIndex] = task;
            editingTaskId = null;
        } else {
            tasks.push(task);
        }
        
        renderTasks();
        resetForm();
        
        showFeedback(editingTaskId ? 'Tarefa atualizada!' : 'Tarefa adicionada!');
    }
    
    function renderTasks() {
        const sortedTasks = [...tasks].sort((a, b) => {
            const filterValue = filterSelect.value;
            
            switch(filterValue) {
                case 'creationDate':
                    return new Date(b.creationDate) - new Date(a.creationDate);
                case 'taskDate':
                    return new Date(a.taskDate) - new Date(b.taskDate);
                case 'priority':
                    const priorityOrder = { 'ALTA': 1, 'MÉDIA': 2, 'BAIXA': 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
        
        tasksContainer.innerHTML = '';
        
        if (sortedTasks.length === 0) {
            tasksContainer.innerHTML = '<div class="empty-message"><i class="fas fa-cloud"></i> Não há tarefas cadastradas</div>';
            return;
        }
        
        sortedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksContainer.appendChild(taskElement);
        });
    }
    
    function createTaskElement(task) {
        const taskDate = new Date(task.taskDate);
        const creationDate = new Date(task.creationDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isOverdue = taskDate < today;
        
        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.priority.toLowerCase().replace('é', 'e')}-priority`;
        taskElement.innerHTML = `
            <div class="task-header">
                <div class="task-title">
                    ${task.title}
                    <span class="task-priority">${task.priority}</span>
                </div>
                <div class="task-date ${isOverdue ? 'overdue' : ''}">
                    <i class="fas fa-calendar-day"></i>
                    ${formatDate(taskDate)}
                    ${isOverdue ? '<i class="fas fa-exclamation-circle"></i>' : ''}
                </div>
            </div>
            <div class="task-description">${task.comment || 'Sem descrição...'}</div>
            ${task.notification === 'SIM' ? '<div class="notification-bell"><i class="fas fa-bell"></i></div>' : ''}
            <div class="task-details">
                <div class="detail-item">
                    <i class="fas fa-calendar-plus"></i>
                    <strong>Criada em:</strong> ${formatDateTime(creationDate)}
                </div>
                <div class="detail-item">
                    <i class="fas fa-comment"></i>
                    <strong>Comentário:</strong> ${task.comment || 'Nenhum comentário'}
                </div>
                <div class="detail-item">
                    <i class="fas fa-bell"></i>
                    <strong>Notificação:</strong> ${task.notification}
                </div>
                ${isOverdue ? '<div class="detail-item overdue"><i class="fas fa-exclamation-triangle"></i> <strong>Esta tarefa está atrasada!</strong></div>' : ''}
            </div>
            <div class="task-actions">
                <button class="action-btn details-btn" data-id="${task.id}">
                    <i class="fas fa-chevron-down"></i> Detalhes
                </button>
                <button class="action-btn edit-btn" data-id="${task.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="action-btn delete-btn" data-id="${task.id}">
                    <i class="fas fa-trash-alt"></i> Remover
                </button>
            </div>
        `;
        
        const detailsBtn = taskElement.querySelector('.details-btn');
        const editBtn = taskElement.querySelector('.edit-btn');
        const deleteBtn = taskElement.querySelector('.delete-btn');
        
        detailsBtn.addEventListener('click', () => toggleTaskDetails(taskElement));
        editBtn.addEventListener('click', () => editTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        return taskElement;
    }
    
    function toggleTaskDetails(taskElement) {
        const details = taskElement.querySelector('.task-details');
        const detailsBtn = taskElement.querySelector('.details-btn');
        
        details.classList.toggle('show');
        
        if (details.classList.contains('show')) {
            detailsBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Ocultar';
        } else {
            detailsBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Detalhes';
        }
    }
    
    function editTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        document.getElementById('title').value = task.title;
        document.getElementById('taskDate').value = task.taskDate;
        document.getElementById('comment').value = task.comment;
        document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;
        document.querySelector(`input[name="notification"][value="${task.notification}"]`).checked = true;
        document.getElementById('taskId').value = task.id;
        
        editingTaskId = task.id;
        
        document.querySelector('.task-form').scrollIntoView({ behavior: 'smooth' });
    }
    
    function deleteTask(taskId) {
        if (confirm('Tem certeza que deseja remover esta tarefa?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            renderTasks();
            showFeedback('Tarefa removida!');
        }
    }
    
    function resetForm() {
        taskForm.reset();
        document.getElementById('taskId').value = '';
        editingTaskId = null;
    }
    
    function formatDate(date) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(date).toLocaleDateString('pt-BR', options);
    }
    
    function formatDateTime(date) {
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(date).toLocaleDateString('pt-BR', options);
    }
    
    function showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = message;
        feedback.style.position = 'fixed';
        feedback.style.bottom = '20px';
        feedback.style.right = '20px';
        feedback.style.backgroundColor = 'var(--pink)';
        feedback.style.color = 'white';
        feedback.style.padding = '10px 20px';
        feedback.style.borderRadius = '10px';
        feedback.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
        feedback.style.zIndex = '1000';
        feedback.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2.7s';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(20px); }
        }
        .overdue {
            color: var(--pink-dark) !important;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
});
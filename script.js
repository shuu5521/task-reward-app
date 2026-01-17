const taskForm = document.querySelector("#task-form");
const taskTitleInput = document.querySelector("#task-title");
const taskRewardInput = document.querySelector("#task-reward");
const taskList = document.querySelector("#task-list");
const clearCompletedButton = document.querySelector("#clear-completed");
const pointsDisplay = document.querySelector("#points");
const streakDisplay = document.querySelector("#streak");
const taskTemplate = document.querySelector("#task-item-template");

const storageKey = "taskRewardApp";

const state = {
  tasks: [],
  points: 0,
  streak: 0,
  lastCompletionDate: null,
};

const formatReward = (value) => `${value}pt`;

const saveState = () => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

const loadState = () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;
  const data = JSON.parse(saved);
  state.tasks = data.tasks ?? [];
  state.points = data.points ?? 0;
  state.streak = data.streak ?? 0;
  state.lastCompletionDate = data.lastCompletionDate ?? null;
};

const renderScoreboard = () => {
  pointsDisplay.textContent = state.points;
  streakDisplay.textContent = state.streak;
};

const updateStreak = () => {
  const today = new Date().toDateString();
  if (state.lastCompletionDate === today) {
    return;
  }

  if (!state.lastCompletionDate) {
    state.streak = 1;
  } else {
    const last = new Date(state.lastCompletionDate);
    const diff = new Date(today) - last;
    const day = 1000 * 60 * 60 * 24;
    if (diff <= day * 1.5) {
      state.streak += 1;
    } else {
      state.streak = 1;
    }
  }

  state.lastCompletionDate = today;
};

const createTaskItem = (task) => {
  const node = taskTemplate.content.firstElementChild.cloneNode(true);
  const checkbox = node.querySelector("input");
  const title = node.querySelector(".task-item__title");
  const reward = node.querySelector(".task-item__reward");
  const deleteButton = node.querySelector("button");

  title.textContent = task.title;
  reward.textContent = formatReward(task.reward);
  checkbox.checked = task.completed;
  node.classList.toggle("completed", task.completed);

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    node.classList.toggle("completed", task.completed);
    if (task.completed) {
      state.points += task.reward;
      updateStreak();
    }
    renderScoreboard();
    saveState();
  });

  deleteButton.addEventListener("click", () => {
    state.tasks = state.tasks.filter((item) => item.id !== task.id);
    node.remove();
    saveState();
  });

  return node;
};

const renderTasks = () => {
  taskList.innerHTML = "";
  state.tasks.forEach((task) => {
    taskList.appendChild(createTaskItem(task));
  });
};

const addTask = (title, reward) => {
  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    reward,
    completed: false,
  });
  renderTasks();
  saveState();
};

const clearCompleted = () => {
  state.tasks = state.tasks.filter((task) => !task.completed);
  renderTasks();
  saveState();
};

const bootstrap = () => {
  loadState();
  renderScoreboard();
  renderTasks();
};

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskTitleInput.value.trim();
  const reward = Number(taskRewardInput.value);
  if (!title || !reward) return;
  addTask(title, reward);
  taskTitleInput.value = "";
});

clearCompletedButton.addEventListener("click", () => {
  clearCompleted();
});

bootstrap();

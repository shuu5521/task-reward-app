const STORAGE_KEY = "task-reward-app-state-v1";

const initialState = {
  points: 0,
  tasks: [],
  rewards: [],
};

const state = loadState();

const pointsEl = document.getElementById("points");
const taskForm = document.getElementById("task-form");
const rewardForm = document.getElementById("reward-form");
const taskListEl = document.getElementById("task-list");
const rewardListEl = document.getElementById("reward-list");
const taskTemplate = document.getElementById("task-item-template");
const rewardTemplate = document.getElementById("reward-item-template");

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const titleEl = document.getElementById("task-title");
  const rewardEl = document.getElementById("task-reward");

  const title = titleEl.value.trim();
  const reward = Number(rewardEl.value);
  if (!title || reward < 1) {
    return;
  }

  state.tasks.push({
    id: crypto.randomUUID(),
    title,
    reward,
  });

  titleEl.value = "";
  rewardEl.value = "10";
  persistAndRender();
});

rewardForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const titleEl = document.getElementById("reward-title");
  const costEl = document.getElementById("reward-cost");

  const title = titleEl.value.trim();
  const cost = Number(costEl.value);
  if (!title || cost < 1) {
    return;
  }

  state.rewards.push({
    id: crypto.randomUUID(),
    title,
    cost,
  });

  titleEl.value = "";
  costEl.value = "30";
  persistAndRender();
});

function completeTask(taskId) {
  const index = state.tasks.findIndex((task) => task.id === taskId);
  if (index < 0) {
    return;
  }
  const [task] = state.tasks.splice(index, 1);
  state.points += task.reward;
  persistAndRender();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  persistAndRender();
}

function redeemReward(rewardId) {
  const reward = state.rewards.find((item) => item.id === rewardId);
  if (!reward) {
    return;
  }
  if (state.points < reward.cost) {
    alert("ポイントが足りません！");
    return;
  }
  state.points -= reward.cost;
  persistAndRender();
}

function deleteReward(rewardId) {
  state.rewards = state.rewards.filter((item) => item.id !== rewardId);
  persistAndRender();
}

function renderTasks() {
  taskListEl.replaceChildren();

  if (state.tasks.length === 0) {
    taskListEl.append(createEmptyMessage("タスクはまだありません。"));
    return;
  }

  state.tasks.forEach((task) => {
    const node = taskTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".item-title").textContent = task.title;
    node.querySelector(".item-meta").textContent = `完了で +${task.reward} pt`;
    node.querySelector(".complete-btn").addEventListener("click", () => completeTask(task.id));
    node.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id));
    taskListEl.append(node);
  });
}

function renderRewards() {
  rewardListEl.replaceChildren();

  if (state.rewards.length === 0) {
    rewardListEl.append(createEmptyMessage("ごほうびはまだありません。"));
    return;
  }

  state.rewards.forEach((reward) => {
    const node = rewardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".item-title").textContent = reward.title;
    node.querySelector(".item-meta").textContent = `必要ポイント: ${reward.cost} pt`;
    node.querySelector(".redeem-btn").addEventListener("click", () => redeemReward(reward.id));
    node.querySelector(".delete-btn").addEventListener("click", () => deleteReward(reward.id));
    rewardListEl.append(node);
  });
}

function createEmptyMessage(message) {
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = message;
  return li;
}

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
}

function render() {
  pointsEl.textContent = String(state.points);
  renderTasks();
  renderRewards();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(initialState);
    }
    const parsed = JSON.parse(raw);
    if (!Number.isFinite(parsed.points) || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.rewards)) {
      return structuredClone(initialState);
    }
    return parsed;
  } catch {
    return structuredClone(initialState);
  }
}

render();

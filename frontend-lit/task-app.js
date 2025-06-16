import { html, css, LitElement } from "lit";

export class TaskApp extends LitElement {
  static properties = {
    tasks: { type: Array },
    filter: { type: String },
    newTask: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      max-width: 400px;
      margin: 2rem auto;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 16px #0001;
      padding: 2rem 2.5rem 2.5rem 2.5rem;
      font-family: "Segoe UI", Arial, sans-serif;
    }
    h2 {
      text-align: center;
      color: #3a3a3a;
      margin-bottom: 1.5rem;
    }
    input[type="text"],
    input[placeholder] {
      width: 70%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 1rem;
      margin-bottom: 0.5rem;
      outline: none;
      transition: border 0.2s;
    }
    input[type="text"]:focus {
      border: 1.5px solid #0078d7;
    }
    button {
      background: #0078d7;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #005fa3;
    }
    .filters {
      margin: 1rem 0 1.5rem 0;
      text-align: center;
    }
    .filters button {
      background: #eaeaea;
      color: #333;
      border: none;
      margin: 0 0.25rem;
      padding: 0.4rem 0.9rem;
      border-radius: 5px;
      font-size: 0.95rem;
      transition: background 0.2s;
    }
    .filters button:hover,
    .filters button.active {
      background: #0078d7;
      color: #fff;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f7f7f7;
      margin-bottom: 0.7rem;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      box-shadow: 0 1px 4px #0001;
      font-size: 1.05rem;
    }
    .completed {
      text-decoration: line-through;
      color: #888;
    }
    li input[type="checkbox"] {
      margin-right: 0.7rem;
      accent-color: #0078d7;
      width: 1.1em;
      height: 1.1em;
    }
    li button {
      background: #ff4d4d;
      color: #fff;
      border: none;
      border-radius: 5px;
      padding: 0.3rem 0.7rem;
      font-size: 0.95rem;
      margin-left: 0.5rem;
      transition: background 0.2s;
    }
    li button:hover {
      background: #c93030;
    }
  `;

  constructor() {
    super();
    this.tasks = [];
    this.filter = "all";
    this.newTask = "";
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchTasks();
  }

  async fetchTasks() {
    let url = "http://localhost:8080/tasks";
    if (this.filter === "completed") url += "?completed=true";
    if (this.filter === "active") url += "?completed=false";
    const res = await fetch(url);
    this.tasks = await res.json();
  }

  get filteredTasks() {
    if (this.filter === "completed")
      return this.tasks.filter((t) => t.completed);
    if (this.filter === "active") return this.tasks.filter((t) => !t.completed);
    return this.tasks;
  }

  updateNewTask(e) {
    this.newTask = e.target.value;
  }

  async addTask() {
    if (!this.newTask.trim()) return;
    const res = await fetch("http://localhost:8080/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: this.newTask, completed: false }),
    });
    if (res.ok) {
      const task = await res.json();
      this.tasks = [task, ...this.tasks]; // Add new task at the top
      this.newTask = "";
    }
  }

  async deleteTask(id) {
    await fetch(`http://localhost:8080/tasks/${id}`, { method: "DELETE" });
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }

  async toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;
    const res = await fetch(`http://localhost:8080/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, completed: !task.completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      this.tasks = this.tasks.map((t) => (t.id === id ? updated : t));
    }
  }

  setFilter(f) {
    this.filter = f;
    this.fetchTasks();
  }

  render() {
    return html`
      <h2>Task Manager</h2>
      <input
        placeholder="Add a task"
        .value=${this.newTask}
        @input=${this.updateNewTask}
        @keydown=${(e) => e.key === "Enter" && this.addTask()}
      />
      <button @click=${this.addTask}>Add</button>
      <div class="filters">
        <button @click=${() => this.setFilter("all")}>All</button>
        <button @click=${() => this.setFilter("active")}>Active</button>
        <button @click=${() => this.setFilter("completed")}>Completed</button>
      </div>
      <ul>
        ${this.filteredTasks.map(
          (t) => html`
            <li>
              <input
                type="checkbox"
                .checked=${t.completed}
                @change=${() => this.toggleTask(t.id)}
              />
              <span class=${t.completed ? "completed" : ""}>${t.title}</span>
              <button @click=${() => this.deleteTask(t.id)}>Delete</button>
            </li>
          `
        )}
      </ul>
    `;
  }
}

customElements.define("task-app", TaskApp);

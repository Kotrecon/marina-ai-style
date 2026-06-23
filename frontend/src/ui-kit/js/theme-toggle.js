// theme-toggle.js — Marina AI Style
// UI-компонент переключателя темы

export class ThemeToggle {
  constructor(service, selector = "#theme-toggle") {
    this.service = service;
    this.button = document.querySelector(selector);
    this.icon = this.button?.querySelector(".icon");
    this.labels = { dark: "Тёмная", light: "Светлая", system: "Системная" };
    this.icons = { dark: "☀️", light: "🌙", system: "🖥️" };
  }

  init() {
    if (!this.button) return;
    this.button.addEventListener("click", () => this._onToggle());
    this.service.onChange((state) => this._render(state));
    this._render({ theme: this.service.getCurrent() });
  }

  _onToggle() {
    const current = this.service.getCurrent();
    const next = current === "dark" ? "light" : current === "light" ? "system" : "dark";
    this.service.toggle(next, { animated: true });
  }

  _render({ theme }) {
    if (this.icon) this.icon.textContent = this.icons[theme] || "🌙";
    this.button?.setAttribute("aria-label", `Тема: ${this.labels[theme]}. Нажмите для смены`);
  }
}

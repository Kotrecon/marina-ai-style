// theme-service.js — Marina AI Style
// Сервис управления темой: dark / light / system

const STORAGE_KEY = "theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

const State = {
  DARK: "dark",
  LIGHT: "light",
  SYSTEM: "system",
};

export const ThemeService = {
  init() {
    this._applyTheme(this._getInitialTheme(), { animated: false });
    this._listenSystemChanges();
  },

  toggle(nextTheme, { animated = true } = {}) {
    this._applyTheme(nextTheme, { animated });
  },

  getCurrent() {
    return localStorage.getItem(STORAGE_KEY) || State.SYSTEM;
  },

  onChange(callback) {
    window.addEventListener("themechange", (e) => callback(e.detail));
  },

  _getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === State.DARK || saved === State.LIGHT) return saved;
    return State.SYSTEM;
  },

  _applyTheme(theme, { animated = true } = {}) {
    const apply = () => {
      const html = document.documentElement;
      if (theme === State.DARK || theme === State.LIGHT) {
        html.setAttribute("data-theme", theme);
        html.style.colorScheme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
      } else {
        html.removeAttribute("data-theme");
        html.style.colorScheme = "";
        localStorage.removeItem(STORAGE_KEY);
      }
      window.dispatchEvent(new CustomEvent("themechange", {
        detail: { theme: this.getCurrent(), isDark: html.getAttribute("data-theme") === State.DARK },
      }));
    };
    if (animated && document.startViewTransition) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  },

  _listenSystemChanges() {
    window.matchMedia(MEDIA_QUERY).addEventListener("change", () => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        this._applyTheme(State.SYSTEM, { animated: true });
      }
    });
  },
};

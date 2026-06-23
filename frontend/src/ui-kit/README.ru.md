# Marina AI Style — UI Kit

> **Русский** | [English](README.md)

Модульная дизайн-система для Marina AI Style — OKLCH-токены, семантические слои, темы dark/light, локальные шрифты.

---

![CSS3](https://img.shields.io/badge/CSS3-OKLCH-1572B6?style=flat&logo=css3)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=flat&logo=javascript)

## Архитектура

```bash
ui-kit/
├── style.css                    # Точка входа
├── css/
│   ├── colors.css               # OKLCH примитивы + семантические токены
│   ├── fonts.css                # @font-face (локальные woff2)
│   └── theme-toggle.css         # Стили переключателя темы
├── tokens/
│   ├── spacing.css              # Шкала отступов (база 4px)
│   ├── radius.css               # Токены скруглений
│   ├── shadows.css              # Тени + элевация
│   ├── layers.css               # Z-index токены
│   ├── sizes.css                # Размеры компонентов
│   └── motion.css               # Длительность, easing, blur
├── base/
│   ├── reset.css                # CSS сброс + скроллбар
│   └── typography.css           # Семейства шрифтов + размеры
├── components/
│   ├── buttons.css              # Токены + стили кнопок
│   ├── forms.css                # Токены + стили инпутов/тоглов
│   ├── feedback.css             # Токены + стили бейджей/алертов/toast
│   ├── data.css                 # Токены + стили карточек/таблиц
│   ├── chart-tokens.css         # Токены цветов графиков
│   └── overlays.css             # Токены + стили модалок
├── layout.css                   # Токены + стили сайдбара/топбара
├── preview.css                  # Витрина дизайн-системы
├── utilities.css                # Утилитарные классы
├── responsive.css               # Адаптивность
├── js/
│   ├── theme-service.js         # Сервис управления темой
│   ├── theme-toggle.js          # UI-компонент переключателя
│   └── navigation.js            # Активное состояние навигации
└── fonts/
    ├── fira-code/woff2/         # Fira Code (5 весов)
    ├── inter/                   # Inter (7 весов)
    └── plus-jakarta-sans/       # Plus Jakarta Sans (6 весов)
```

## Архитектура токенов

Три слоя с чётким разделением:

1. **Primitive** — `--color-brand-500`, `--color-neutral-900` (OKLCH)
2. **Semantic** — `--bg-app`, `--text-primary`, `--border-default`
3. **Component** — `--button-primary-bg`, `--input-radius` (внутри CSS компонентов)

## Темы

```html
<!-- Тёмная (по умолчанию) -->
<html data-theme="dark">
  <!-- Светлая -->
  <html data-theme="light">
    <!-- Автоматическая (системные настройки) -->
    <html>
      <!-- без атрибута data-theme -->
    </html>
  </html>
</html>
```

## Типографика

| Шрифт             | Роль           | Веса    |
| ----------------- | -------------- | ------- |
| Plus Jakarta Sans | Заголовки      | 300–800 |
| Inter             | Основной текст | 300–900 |
| Fira Code         | Код/метрики    | 300–700 |

## Быстрый старт

```html
<link rel="stylesheet" href="ui-kit/style.css" />
```

```css
:root {
  --bg-app: var(--color-neutral-950);
  --text-primary: var(--color-neutral-50);
  --font-body: "Inter", sans-serif;
}
```

## Файлы (22 CSS + 3 JS + 1 HTML)

| Файл                          | Размер | Назначение                             |
| ----------------------------- | ------ | -------------------------------------- |
| `css/colors.css`              | 8 KB   | OKLCH примитивы + семантические токены |
| `css/fonts.css`               | 5 KB   | @font-face декларации                  |
| `tokens/spacing.css`          | 1.2 KB | Шкала отступов (база 4px)              |
| `tokens/radius.css`           | 0.3 KB | Токены скруглений                      |
| `tokens/shadows.css`          | 0.6 KB | Тени + элевация                        |
| `tokens/layers.css`           | 0.3 KB | Z-index токены                         |
| `tokens/sizes.css`            | 0.7 KB | Размеры компонентов                    |
| `tokens/motion.css`           | 1.4 KB | Длительность, easing, blur             |
| `base/reset.css`              | 0.8 KB | CSS сброс                              |
| `base/typography.css`         | 0.6 KB | Утилиты шрифтов                        |
| `layout.css`                  | 4.4 KB | Сайдбар/топбар/макет                   |
| `components/buttons.css`      | 3.4 KB | Система кнопок                         |
| `components/forms.css`        | 2.4 KB | Система инпутов/тоглов                 |
| `components/feedback.css`     | 3.6 KB | Система бейджей/алертов/toast          |
| `components/data.css`         | 2 KB   | Система карточек/таблиц                |
| `components/chart-tokens.css` | 0.9 KB | Токены цветов графиков                 |
| `components/overlays.css`     | 0.9 KB | Система модалок                        |
| `utilities.css`               | 0.6 KB | Утилитарные классы                     |
| `responsive.css`              | 0.3 KB | Брейкпоинты                            |
| `preview.css`                 | 3.9 KB | Витрина дизайн-системы                 |

## Как вносить изменения

### Изменить цвет

1. Открыть `css/colors.css`
2. Найти примитивный токен: `--color-brand-500: oklch(0.59 0.19 15)`
3. Изменить OKLCH значение
4. Все семантические токены обновятся автоматически

### Добавить новую переменную

1. Выбрать слой:
   - **Primitive**: добавить в `css/colors.css` в блок `:root`
   - **Semantic**: добавить в `css/colors.css` в блок темы (`:root`, `html[data-theme="light"]`)
   - **Component**: добавить в CSS-файл компонента (например, `components/buttons.css`)
2. Ссылаться на существующие токены, не на хардкод
3. Запустить `export-design.js` для обновления DESIGN.md

### Добавить новый компонент

1. Создать `components/new-component.css`
2. Добавить токены компонента в начало файла (в блок `:root`)
3. Написать CSS-правила, используя семантические токены
4. Добавить импорт в `style.css`
5. Добавить селектор компонента в `js/export-design.js` → массив `COMPONENT_SELECTORS`
6. Запустить экспорт для обновления DESIGN.md

### Изменить поведение темы

- Тёмная по умолчанию: блок `:root` в `css/colors.css`
- Светлые переопределения: блок `html[data-theme="light"]`
- Авто-фоллбэк: блок `@media (prefers-color-scheme: light)`

## Автор

**[@Kotrecon](https://github.com/Kotrecon)**

Архитектор решений из Санкт-Петербурга. Специализация: .NET, C#, JS, Python, AI/ML, RAG, Агенты, DevOps, GitHub, GitLab, CI/CD, АСУ ТП, промышленное ПО, DB, PostgreSQL.
[Telegram](https://t.me/Kotrecon) | [Email](mailto:ermakov_k@mail.ru)

---

## Лицензия

MIT

# Marina AI Style — UI Kit

> [Русский](README.ru.md) | **English**

Modular design system for Marina AI Style — OKLCH tokens, semantic layers, dark/light themes, local fonts.

---

![CSS3](https://img.shields.io/badge/CSS3-OKLCH-1572B6?style=flat&logo=css3)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=flat&logo=javascript)

## Architecture

```bash
ui-kit/
├── README.md                    # This file (English)
├── README.ru.md                 # Russian version
├── style.css                    # Entry point
├── design-system.html           # Interactive vitrina
├── css/
│   ├── colors.css               # OKLCH primitives + semantic tokens
│   ├── fonts.css                # @font-face (local woff2)
│   └── theme-toggle.css         # Theme toggle styles
├── tokens/
│   ├── spacing.css              # Space scale (4px base)
│   ├── radius.css               # Border radius tokens
│   ├── shadows.css              # Shadow + elevation tokens
│   ├── layers.css               # Z-index tokens
│   ├── sizes.css                # Width/height tokens
│   └── motion.css               # Duration, easing, blur
├── base/
│   ├── reset.css                # CSS reset + scrollbar
│   └── typography.css           # Font families + sizes
├── components/
│   ├── buttons.css              # Button tokens + styles
│   ├── forms.css                # Input/toggle tokens + styles
│   ├── feedback.css             # Badge/alert/toast tokens + styles
│   ├── data.css                 # Card/table tokens + styles
│   ├── chart-tokens.css         # Chart color tokens
│   └── overlays.css             # Modal tokens + styles
├── layout.css                   # Sidebar/topbar tokens + layout
├── preview.css                  # Design system preview (vitrina only)
├── utilities.css                # Utility classes
├── responsive.css               # Breakpoint overrides
├── js/
│   ├── theme-service.js         # Theme management service
│   ├── theme-toggle.js          # Theme toggle UI component
│   └── navigation.js            # Navigation active state
└── fonts/
    ├── fira-code/woff2/         # Fira Code (5 weights)
    ├── inter/                   # Inter (7 weights)
    └── plus-jakarta-sans/       # Plus Jakarta Sans (6 weights)
```

## Token Architecture

Three layers with clear separation:

1. **Primitive** — `--color-brand-500`, `--color-neutral-900` (OKLCH)
2. **Semantic** — `--bg-app`, `--text-primary`, `--border-default`
3. **Component** — `--button-primary-bg`, `--input-radius` (inside component CSS)

## Themes

```html
<!-- Dark (default) -->
<html data-theme="dark">
  <!-- Light -->
  <html data-theme="light">
    <!-- Auto (system preference) -->
    <html>
      <!-- no data-theme attribute -->
    </html>
  </html>
</html>
```

## Typography

| Font              | Role         | Weights |
| ----------------- | ------------ | ------- |
| Plus Jakarta Sans | Headings     | 300–800 |
| Inter             | Body text    | 300–900 |
| Fira Code         | Code/metrics | 300–700 |

## Getting Started

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

## Design System Vitrina

`design-system.html` — interactive showcase of all design tokens and components.

### Sections

| Section    | Token Category        | Components                                 |
| ---------- | --------------------- | ------------------------------------------ |
| Colors     | Primitives + Semantic | Swatches, color pickers                    |
| Typography | Fonts + Sizes         | Type scale, font weights                   |
| Spacing    | Scale + Component     | Spacing bars, radius boxes                 |
| Shadows    | Shadow + Elevation    | Shadow cards                               |
| Motion     | Duration + Easing     | Hover demos, blur                          |
| Icons      | Emoji icons           | Icon grid                                  |
| Buttons    | Button tokens         | Primary, secondary, ghost, danger, success |
| Inputs     | Input + Toggle tokens | Text fields, toggles                       |
| Cards      | Card tokens           | Content cards with badges                  |
| Badges     | Feedback tokens       | Status badges                              |
| Alerts     | Feedback tokens       | System alerts                              |
| Toggles    | Form tokens           | On/Off switches                            |
| Tables     | Data tokens           | Data tables                                |
| Modal      | Overlay tokens        | Modal dialog                               |
| Links      | Link tokens           | Link states                                |
| Focus      | Accessibility         | Focus ring demo                            |
| Charts     | Chart tokens          | Chart color palette                        |

### Navigation

Sidebar with anchor links to each section. Active state tracked via JavaScript (`navigation.js`).

### Scripts

- `js/theme-service.js` — Theme management (dark/light/system)
- `js/theme-toggle.js` — Toggle button UI component
- `js/navigation.js` — Active nav-link state management

### CSS Imports

```html
<link rel="stylesheet" href="style.css" />
<link rel="stylesheet" href="preview.css" />
<link rel="stylesheet" href="css/theme-toggle.css" />
```

| File                          | Size   | Purpose                            |
| ----------------------------- | ------ | ---------------------------------- |
| `css/colors.css`              | 8 KB   | OKLCH primitives + semantic tokens |
| `css/fonts.css`               | 5 KB   | @font-face declarations            |
| `tokens/spacing.css`          | 1.2 KB | 4px grid spacing scale             |
| `tokens/radius.css`           | 0.3 KB | Border radius tokens               |
| `tokens/shadows.css`          | 0.6 KB | Shadow + elevation tokens          |
| `tokens/layers.css`           | 0.3 KB | Z-index tokens                     |
| `tokens/sizes.css`            | 0.7 KB | Component size tokens              |
| `tokens/motion.css`           | 1.4 KB | Duration, easing, blur             |
| `base/reset.css`              | 0.8 KB | CSS reset                          |
| `base/typography.css`         | 0.6 KB | Font utilities                     |
| `layout.css`                  | 4.4 KB | Sidebar/topbar/layout              |
| `components/buttons.css`      | 3.4 KB | Button system                      |
| `components/forms.css`        | 2.4 KB | Input/toggle system                |
| `components/feedback.css`     | 3.6 KB | Badge/alert/toast system           |
| `components/data.css`         | 2 KB   | Card/table system                  |
| `components/chart-tokens.css` | 0.9 KB | Chart color tokens                 |
| `components/overlays.css`     | 0.9 KB | Modal system                       |
| `utilities.css`               | 0.6 KB | Utility classes                    |
| `responsive.css`              | 0.3 KB | Breakpoints                        |
| `preview.css`                 | 3.9 KB | Design system vitrina              |

## How to Modify

### Change a color

1. Open `css/colors.css`
2. Find the primitive token: `--color-brand-500: oklch(0.59 0.19 15)`
3. Change the OKLCH value
4. All semantic tokens referencing it will update automatically

### Add a new variable

1. Choose the right layer:
   - **Primitive**: add to `css/colors.css` in `:root` block
   - **Semantic**: add to `css/colors.css` in theme block (`:root`, `html[data-theme="light"]`)
   - **Component**: add to the component CSS file (e.g., `components/buttons.css`)
2. Reference existing tokens, not hardcoded values
3. Run `export-design.js` to update DESIGN.md

### Add a new component

1. Create `components/new-component.css`
2. Add component tokens at the top of the file (in `:root` block)
3. Add CSS rules using semantic tokens
4. Add the file to `style.css` imports
5. Add the component selector to `js/export-design.js` → `COMPONENT_SELECTORS` array
6. Run export to update DESIGN.md

### Change theme behavior

- Dark default: `:root` block in `css/colors.css`
- Light overrides: `html[data-theme="light"]` block
- Auto fallback: `@media (prefers-color-scheme: light)` block

## Author

**[@Kotrecon](https://github.com/Kotrecon)**

Solution architect from Saint Petersburg. Specialization: .NET, C#, JS, Python, AI/ML, RAG, Agents, DevOps, GitHub, GitLab, CI/CD, Industrial Software, DB, PostgreSQL.
[Telegram](https://t.me/Kotrecon) | [Email](mailto:ermakov_k@mail.ru)

---

## License

MIT

// js/export-design.js
// Auto-generates DESIGN.md from CSS tokens and component rules
document.addEventListener("DOMContentLoaded", () => {
  // ===== TOAST (если глобального нет) =====
  if (typeof window.showToast !== "function") {
    window.showToast = function (message) {
      let container = document.getElementById("toastContainer");
      if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.cssText =
          "position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;";
        document.body.appendChild(container);
      }

      const toast = document.createElement("div");
      toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:oklch(0.72 0.19 145);">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>${message}</span>
      `;
      toast.style.cssText = `
        display:flex;
        align-items:center;
        gap:10px;
        background:oklch(0.14 0.005 0);
        color:oklch(0.98 0.005 0);
        padding:14px 20px;
        border-radius:12px;
        border:1px solid oklch(0.32 0.01 0);
        box-shadow:0 12px 40px -8px oklch(0 0 0 / 0.35);
        font:14px/1.4 Inter, sans-serif;
        opacity:0;
        transform:translateY(12px);
        transition:opacity 0.25s ease, transform 0.25s ease;
        pointer-events:auto;
      `;

      container.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
      });

      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(12px)";
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    };
  }

  // ===== КНОПКА ЭКСПОРТА =====
  const exportBtn = document.getElementById("exportDesignBtn");

  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      try {
        const data = await loadDesignSystem();
        const markdown = generateDesignMarkdown(data);
        downloadFile("DESIGN.md", markdown);
        showToast("DESIGN.md exported successfully!");
      } catch (err) {
        console.error("Export error:", err);
        showToast("Export error: " + err.message);
      }
    });
  }

  // ===== 1. КОНФИГУРАЦИЯ =====

  const CSS_FILES = [
    "css/colors.css",
    "css/fonts.css",
    "tokens/spacing.css",
    "tokens/radius.css",
    "tokens/shadows.css",
    "tokens/layers.css",
    "tokens/sizes.css",
    "tokens/motion.css",
    "base/reset.css",
    "base/typography.css",
    "layout.css",
    "components/buttons.css",
    "components/forms.css",
    "components/feedback.css",
    "components/data.css",
    "components/chart-tokens.css",
    "components/overlays.css",
    "utilities.css",
    "responsive.css",
  ];

  const SKIP_SELECTORS = [
    ":root",
    "html",
    "*",
    "*::before",
    "*::after",
    "body",
    "a",
    "::-webkit-scrollbar",
    "::-webkit-scrollbar-track",
    "::-webkit-scrollbar-thumb",
  ];

  const COMPONENT_SELECTORS = [
    ".btn",
    ".btn-primary",
    ".btn-secondary",
    ".btn-ghost",
    ".btn-danger",
    ".btn-success",
    ".btn-sm",
    ".btn-lg",
    ".card",
    ".input",
    ".label",
    ".hint",
    ".err",
    ".badge",
    ".badge-brand",
    ".badge-success",
    ".badge-warning",
    ".badge-error",
    ".badge-info",
    ".badge-purple",
    ".alert",
    ".alert-info",
    ".alert-success",
    ".alert-warning",
    ".alert-error",
    ".toggle",
    ".toggle.on",
    ".modal-overlay",
    ".modal-content",
    "table",
    "th",
    "td",
    ".progress-track",
    ".progress-fill",
    ".toast",
  ];

  // ===== 2. ЗАГРУЗКА ДИЗАЙН-СИСТЕМЫ =====

  async function loadDesignSystem() {
    const tokensByContext = {
      default: new Map(),
      light: new Map(),
      dark: new Map(),
      auto: new Map(),
    };
    const componentRules = [];
    const loadErrors = [];

    for (const file of CSS_FILES) {
      try {
        const response = await fetch(file);
        if (!response.ok) {
          const msg = `${file}: ${response.status} ${response.statusText}`;
          loadErrors.push(msg);
          console.warn(`⚠ ${msg}`);
          continue;
        }
        const rawCss = await response.text();
        const css = removeComments(rawCss);
        const blocks = parseBlocks(css);

        for (const block of blocks) {
          const context = detectContext(block.selector);
          const tokens = parseTokenBlock(block.body);

          const targetMap = tokensByContext[context] || tokensByContext.default;
          for (const [name, value] of tokens) {
            if (!targetMap.has(name)) {
              targetMap.set(name, { value, file });
            }
          }

          const rules = parseComponentRules(block.selector, block.body, file);
          componentRules.push(...rules);
        }
      } catch (err) {
        const msg = `${file}: ${err.message}`;
        loadErrors.push(msg);
        console.warn(`⚠ ${msg}`);
      }
    }

    for (const ctx of Object.keys(tokensByContext)) {
      resolveReferences(tokensByContext[ctx], tokensByContext.default);
    }

    resolveRulesReferences(componentRules, tokensByContext.default);

    return { tokensByContext, componentRules, loadErrors };
  }

  // ===== 3. ПАРСЕРЫ =====

  function removeComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, "");
  }

  function parseBlocks(css, parentSelector = "") {
    const blocks = [];
    let i = 0;
    while (i < css.length) {
      const braceStart = css.indexOf("{", i);
      if (braceStart === -1) break;

      const rawSelector = css.substring(i, braceStart).trim();
      const selector = parentSelector
        ? `${parentSelector} ${rawSelector}`.trim()
        : rawSelector;

      let depth = 1;
      let j = braceStart + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === "{") depth++;
        else if (css[j] === "}") depth--;
        j++;
      }

      const body = css.substring(braceStart + 1, j - 1);

      if (
        selector.startsWith("@media") ||
        selector.startsWith("@supports") ||
        selector.startsWith("@layer") ||
        selector.startsWith("@container")
      ) {
        blocks.push(...parseBlocks(body, selector));
      } else if (selector) {
        blocks.push({ selector, body });
      }
      i = j;
    }
    return blocks;
  }

  function detectContext(selector) {
    if (selector.includes('data-theme="light"')) return "light";
    if (selector.includes('data-theme="dark"')) return "dark";
    if (selector.includes("prefers-color-scheme")) return "auto";
    if (selector === ":root") return "default";
    return "default";
  }

  function parseTokenBlock(body) {
    const tokens = new Map();
    const regex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let match;
    while ((match = regex.exec(body)) !== null) {
      const name = match[1];
      let value = match[2]
        .trim()
        .replace(/\s*!important\s*$/, "")
        .trim();
      value = value.replace(/\s+/g, " ");
      if (value) {
        tokens.set(name, value);
      }
    }
    return tokens;
  }

  // ===== 4. РАЗРЕШЕНИЕ ССЫЛОК =====

  function resolveReferences(targetMap, fallbackMap) {
    const maxDepth = 20;
    for (let depth = 0; depth < maxDepth; depth++) {
      let changed = false;
      for (const [key, entry] of targetMap) {
        if (!entry.value.includes("var(--")) continue;

        const resolved = entry.value.replace(
          /var\(--([\w-]+)\)/g,
          (match, varName) => {
            if (varName === key) return match;
            const ref = targetMap.get(varName) || fallbackMap?.get(varName);
            return ref ? ref.value : match;
          },
        );

        if (resolved !== entry.value) {
          entry.value = resolved;
          changed = true;
        }
      }
      if (!changed) break;
    }
  }

  function resolveRulesReferences(rules, fallbackMap) {
    for (const rule of rules) {
      for (const prop of rule.properties) {
        if (prop.value.includes("var(--")) {
          prop.value = prop.value.replace(
            /var\(--([\w-]+)\)/g,
            (match, varName) => {
              const ref = fallbackMap.get(varName);
              return ref ? ref.value : match;
            },
          );
        }
      }
    }
  }

  // ===== 5. ПАРСИНГ КОМПОНЕНТОВ =====

  function parseComponentRules(selector, body, file) {
    if (
      SKIP_SELECTORS.some(
        (skip) => selector === skip || selector.startsWith(skip + " "),
      )
    ) {
      return [];
    }
    if (
      selector.startsWith("@") ||
      selector.startsWith("html[") ||
      selector.startsWith(":root")
    ) {
      return [];
    }

    const rules = [];
    for (const compSelector of COMPONENT_SELECTORS) {
      const escaped = compSelector.replace(".", "\\.");
      const regex = new RegExp(`(${escaped}[^{,{]*)\\{([^}]+)\\}`, "g");
      let match;
      while ((match = regex.exec(body)) !== null) {
        const fullSelector = match[1].trim();
        const propsBody = match[2];
        const properties = [];

        const propRegex = /([\w-]+)\s*:\s*([^;]+);/g;
        let propMatch;
        while ((propMatch = propRegex.exec(propsBody)) !== null) {
          properties.push({
            property: propMatch[1],
            value: propMatch[2].trim().replace(/\s+/g, " "),
          });
        }

        if (properties.length > 0) {
          rules.push({ selector: fullSelector, properties, file });
        }
      }
    }
    return rules;
  }

  // ===== 6. КЛАССИФИКАЦИЯ ТОКЕНОВ =====

  function classifyTokens(tokensMap) {
    const groups = {
      brand: [],
      accent: [],
      neutral: [],
      status: [],
      backgrounds: [],
      text: [],
      borders: [],
      actions: [],
      spacing: [],
      radius: [],
      shadows: [],
      duration: [],
      easing: [],
      blur: [],
      transitions: [],
      fonts: [],
      sizes: [],
      layers: [],
      surfaces: [],
      links: [],
      charts: [],
      overlays: [],
      gradients: [],
      focus: [],
      rgb: [],
      componentTokens: [],
      other: [],
    };

    for (const [name, entry] of tokensMap) {
      const lower = name.toLowerCase();

      if (lower.startsWith("color-brand-"))
        groups.brand.push({ name, ...entry });
      else if (lower.startsWith("color-accent-"))
        groups.accent.push({ name, ...entry });
      else if (lower.startsWith("color-neutral-"))
        groups.neutral.push({ name, ...entry });
      else if (
        [
          "color-success",
          "color-warning",
          "color-error",
          "color-info",
          "color-purple",
          "color-teal",
        ].includes(lower)
      ) {
        groups.status.push({ name, ...entry });
      } else if (lower.startsWith("bg-"))
        groups.backgrounds.push({ name, ...entry });
      else if (lower.startsWith("text-")) groups.text.push({ name, ...entry });
      else if (lower.startsWith("border-"))
        groups.borders.push({ name, ...entry });
      else if (lower.startsWith("action-"))
        groups.actions.push({ name, ...entry });
      else if (lower.startsWith("space-"))
        groups.spacing.push({ name, ...entry });
      else if (lower.startsWith("radius-"))
        groups.radius.push({ name, ...entry });
      else if (lower.startsWith("shadow-") || lower.startsWith("elevation-"))
        groups.shadows.push({ name, ...entry });
      else if (lower.startsWith("duration-"))
        groups.duration.push({ name, ...entry });
      else if (lower.startsWith("ease-"))
        groups.easing.push({ name, ...entry });
      else if (lower.startsWith("backdrop-blur"))
        groups.blur.push({ name, ...entry });
      else if (lower.startsWith("transition-"))
        groups.transitions.push({ name, ...entry });
      else if (lower.startsWith("font-size-"))
        groups.sizes.push({ name, ...entry });
      else if (lower.startsWith("font-")) groups.fonts.push({ name, ...entry });
      else if (lower.startsWith("size-")) groups.sizes.push({ name, ...entry });
      else if (lower.startsWith("z-")) groups.layers.push({ name, ...entry });
      else if (lower.startsWith("surface-"))
        groups.surfaces.push({ name, ...entry });
      else if (lower.startsWith("link-")) groups.links.push({ name, ...entry });
      else if (lower.startsWith("chart-"))
        groups.charts.push({ name, ...entry });
      else if (lower.startsWith("modal-") || lower.startsWith("overlay-"))
        groups.overlays.push({ name, ...entry });
      else if (lower.startsWith("gradient-"))
        groups.gradients.push({ name, ...entry });
      else if (lower.startsWith("focus-"))
        groups.focus.push({ name, ...entry });
      else if (lower.endsWith("-rgb")) groups.rgb.push({ name, ...entry });
      else if (
        lower.startsWith("button-") ||
        lower.startsWith("card-") ||
        lower.startsWith("input-") ||
        lower.startsWith("badge-") ||
        lower.startsWith("alert-") ||
        lower.startsWith("toggle-") ||
        lower.startsWith("toast-") ||
        lower.startsWith("table-") ||
        ["success", "warning", "error", "info", "purple", "brand"].some(
          (prefix) => lower.startsWith(prefix + "-"),
        )
      ) {
        groups.componentTokens.push({ name, ...entry });
      } else groups.other.push({ name, ...entry });
    }
    return groups;
  }

  // ===== 7. ГЕНЕРАЦИЯ MARKDOWN =====

  function generateDesignMarkdown({
    tokensByContext,
    componentRules,
    loadErrors,
  }) {
    const lines = [];
    const tokens = tokensByContext.default;
    const lightTokens = tokensByContext.light;
    const groups = classifyTokens(tokens);

    // --- HEADER ---
    lines.push("# Marina AI Style — Design System Reference");
    lines.push(
      "> AI-powered wardrobe assistant · OKLCH color space · Auto-generated from CSS tokens",
    );
    lines.push("");
    lines.push(
      '**Theme:** dark (default) with light mode via `data-theme="light"` and `prefers-color-scheme`',
    );
    lines.push("");

    const brandColor = tokens.get("color-brand-500")?.value || "—";
    const accentColor = tokens.get("color-accent-500")?.value || "—";
    const bgApp = tokens.get("bg-app")?.value || "—";

    lines.push(
      `Marina AI Style is a modern dark-first design system built on OKLCH color space. Brand accent is pink-red (hue 15°, \`${brandColor}\`) with purple secondary (hue 290°, \`${accentColor}\`). Typography combines Plus Jakarta Sans (display), Inter (body), and Fira Code (mono) — all served locally via \`@font-face\`. Components use a 4px spacing base, 8–16px radii, and layered shadows in OKLCH black.`,
    );
    lines.push("");

    if (loadErrors && loadErrors.length > 0) {
      lines.push("> ⚠ **Warning:** Some files failed to load:");
      loadErrors.forEach((err) => lines.push(`> - ${err}`));
      lines.push("");
    }

    lines.push("---");
    lines.push("");

    // --- COLORS ---
    lines.push("## Tokens — Colors");
    lines.push("");
    lines.push(
      "All colors use OKLCH for perceptual uniformity. Format: `oklch(L C H)` or `oklch(L C H / alpha)`.",
    );
    lines.push("");

    renderColorGroup(
      lines,
      "Brand",
      "Primary brand color — CTAs, active states, links, focus rings",
      groups.brand,
    );
    renderColorGroup(
      lines,
      "Accent",
      "Secondary accent — decorative highlights, visited links",
      groups.accent,
    );
    renderColorGroup(
      lines,
      "Neutral",
      "Backgrounds, text, borders — the structural palette",
      groups.neutral,
    );
    renderColorGroup(
      lines,
      "Status",
      "Success, warning, error, info — used for feedback states",
      groups.status,
    );

    lines.push("### Semantic Tokens");
    lines.push("");
    lines.push(
      "High-level tokens that map to primitives. Use these in components — never hardcode primitives.",
    );
    lines.push("");

    renderSemanticGroup(lines, "Backgrounds", groups.backgrounds);
    renderSemanticGroup(lines, "Text", groups.text);
    renderSemanticGroup(lines, "Borders", groups.borders);
    renderSemanticGroup(lines, "Actions", groups.actions);

    if (lightTokens.size > 0) {
      const lightDiffs = findDifferences(tokens, lightTokens);
      if (lightDiffs.length > 0) {
        lines.push("### Light Theme Overrides");
        lines.push("");
        lines.push(
          'These tokens change value when `html[data-theme="light"]` is set:',
        );
        lines.push("");
        lines.push("| Token | Dark Value | Light Value |");
        lines.push("|-------|------------|-------------|");
        lightDiffs.forEach(({ name, darkValue, lightValue }) => {
          lines.push(
            `| \`--${name}\` | \`${darkValue}\` | \`${lightValue}\` |`,
          );
        });
        lines.push("");
      }
    }

    if (groups.gradients.length > 0) {
      lines.push("### Gradients");
      lines.push("");
      lines.push("| Token | Value |");
      lines.push("|-------|-------|");
      groups.gradients.forEach((item) => {
        lines.push(`| \`--${item.name}\` | \`${item.value}\` |`);
      });
      lines.push("");
    }

    // --- TYPOGRAPHY ---
    lines.push("## Tokens — Typography");
    lines.push("");

    if (groups.fonts.length > 0) {
      lines.push("### Font Families");
      lines.push("");
      lines.push("| Token | Value | Role |");
      lines.push("|-------|-------|------|");

      const fontRoles = {
        "font-display": "Headings, display text, section titles",
        "font-body": "Body text, UI labels, buttons",
        "font-mono": "Code snippets, technical labels, data values",
      };

      groups.fonts.forEach((item) => {
        const role = fontRoles[item.name] || "—";
        lines.push(`| \`--${item.name}\` | \`${item.value}\` | ${role} |`);
      });
      lines.push("");
    }

    lines.push("### Font Weights");
    lines.push("");
    lines.push(
      "All three fonts support: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black).",
    );
    lines.push("");

    lines.push("### Type Scale");
    lines.push("");
    lines.push("| Role | Size | Weight | Line Height | Usage |");
    lines.push("|------|------|--------|-------------|-------|");
    lines.push("| display | 48px | 900 | 1.0 | Hero headlines |");
    lines.push("| h1 | 36px | 700 | 1.2 | Page titles |");
    lines.push("| h2 | 30px | 700 | 1.2 | Section titles |");
    lines.push("| h3 | 24px | 600 | 1.3 | Subsections |");
    lines.push("| h4 | 20px | 600 | 1.3 | Card titles |");
    lines.push("| body | 14px | 400 | 1.6 | Main text |");
    lines.push("| caption | 12px | 400 | 1.4 | Labels, metadata |");
    lines.push("| overline | 10px | 600 | 1.25 | Eyebrows, tags |");
    lines.push("");

    // --- SPACING ---
    if (groups.spacing.length > 0) {
      lines.push("## Tokens — Spacing");
      lines.push("");
      lines.push("Base unit: 4px. All spacing is a multiple of 4.");
      lines.push("");

      const sorted = [...groups.spacing].sort((a, b) => {
        const numA = parseInt(a.name.replace("space-", "")) || 0;
        const numB = parseInt(b.name.replace("space-", "")) || 0;
        return numA - numB;
      });

      const numericSpacing = sorted.filter((s) => {
        const num = parseInt(s.name.replace("space-", ""));
        return !isNaN(num) && num <= 16;
      });

      const componentSpacing = sorted.filter((s) => {
        const num = parseInt(s.name.replace("space-", ""));
        return isNaN(num);
      });

      if (numericSpacing.length > 0) {
        lines.push("### Scale");
        lines.push("");
        lines.push("| Token | Value |");
        lines.push("|-------|-------|");
        numericSpacing.forEach((item) => {
          lines.push(`| \`--${item.name}\` | ${item.value} |`);
        });
        lines.push("");
      }

      if (componentSpacing.length > 0) {
        lines.push("### Component Spacing");
        lines.push("");
        lines.push("| Token | Value | Component |");
        lines.push("|-------|-------|-----------|");
        componentSpacing.forEach((item) => {
          const component = item.name.replace("space-", "").replace(/-/g, " ");
          lines.push(`| \`--${item.name}\` | ${item.value} | ${component} |`);
        });
        lines.push("");
      }
    }

    // --- RADIUS ---
    if (groups.radius.length > 0) {
      lines.push("## Tokens — Border Radius");
      lines.push("");
      lines.push("| Token | Value | Typical Usage |");
      lines.push("|-------|-------|---------------|");

      const radiusUsage = {
        "radius-none": "Sharp corners",
        "radius-sm": "Tags, small chips, progress bars",
        "radius-md": "Buttons (sm), inputs",
        "radius-lg": "Buttons (default), cards, alerts, badges",
        "radius-xl": "Modals, large containers, sidebar CTA",
        "radius-2xl": "Hero sections",
        "radius-full": "Pills, avatars, toggles",
      };

      groups.radius.forEach((item) => {
        const usage = radiusUsage[item.name] || "—";
        lines.push(`| \`--${item.name}\` | ${item.value} | ${usage} |`);
      });
      lines.push("");
    }

    // --- SHADOWS ---
    if (groups.shadows.length > 0) {
      lines.push("## Tokens — Shadows");
      lines.push("");
      lines.push(
        "All shadows use OKLCH black (`oklch(0 0 0)`) with increasing opacity.",
      );
      lines.push("");
      lines.push("| Token | Value |");
      lines.push("|-------|-------|");
      groups.shadows.forEach((item) => {
        lines.push(`| \`--${item.name}\` | \`${item.value}\` |`);
      });
      lines.push("");
    }

    // --- MOTION ---
    lines.push("## Tokens — Motion");
    lines.push("");

    renderMotionGroup(lines, "Duration", groups.duration);
    renderMotionGroup(lines, "Easing", groups.easing);
    renderMotionGroup(lines, "Backdrop Blur", groups.blur);
    renderMotionGroup(lines, "Transition Composites", groups.transitions);

    // --- SIZES ---
    if (groups.sizes.length > 0) {
      lines.push("## Tokens — Sizes");
      lines.push("");
      lines.push("| Token | Value | Component |");
      lines.push("|-------|-------|-----------|");
      groups.sizes.forEach((item) => {
        const component = item.name
          .replace("size-", "")
          .replace("font-size-", "font size ")
          .replace(/-/g, " ");
        lines.push(`| \`--${item.name}\` | ${item.value} | ${component} |`);
      });
      lines.push("");
    }

    // --- LAYERS ---
    if (groups.layers.length > 0) {
      lines.push("## Tokens — Z-Index Layers");
      lines.push("");
      lines.push("| Token | Value | Purpose |");
      lines.push("|-------|-------|---------|");

      const layerPurposes = {
        "z-base": "Default stacking",
        "z-dropdown": "Dropdowns, popovers",
        "z-sticky": "Sticky headers, topbar",
        "z-sidebar": "Sidebar navigation",
        "z-overlay": "Modal overlays, backdrops",
        "z-modal": "Modal content",
        "z-toast": "Toast notifications",
      };

      [...groups.layers]
        .sort((a, b) => {
          const numA = parseInt(a.value) || 0;
          const numB = parseInt(b.value) || 0;
          return numA - numB;
        })
        .forEach((item) => {
          const purpose = layerPurposes[item.name] || "—";
          lines.push(`| \`--${item.name}\` | ${item.value} | ${purpose} |`);
        });
      lines.push("");
    }

    // --- STATE GROUPS ---
    const stateGroups = [
      ["Surface States", groups.surfaces],
      ["Links", groups.links],
      ["Chart Colors", groups.charts],
      ["Overlays & Modals", groups.overlays],
      ["RGB Bases", groups.rgb],
      ["Focus Ring", groups.focus],
    ];

    for (const [title, group] of stateGroups) {
      if (group.length === 0) continue;
      lines.push(`## Tokens — ${title}`);
      lines.push("");
      lines.push("| Token | Value |");
      lines.push("|-------|-------|");
      group.forEach((item) => {
        lines.push(`| \`--${item.name}\` | \`${item.value}\` |`);
      });
      lines.push("");
    }

    // --- COMPONENT TOKENS ---
    if (groups.componentTokens.length > 0) {
      lines.push("## Component Tokens");
      lines.push("");
      lines.push(
        "Component-specific tokens extracted from component CSS files. Use these to build consistent UI elements.",
      );
      lines.push("");
      lines.push("| Token | Value |");
      lines.push("|-------|-------|");
      groups.componentTokens.forEach((item) => {
        lines.push(`| \`--${item.name}\` | \`${item.value}\` |`);
      });
      lines.push("");
    }

    // --- ACCESSIBILITY ---
    lines.push("## Accessibility");
    lines.push("");
    lines.push("### Focus Ring");
    lines.push("");
    const focusRing = tokens.get("focus-ring")?.value;
    if (focusRing) {
      lines.push(`\`--focus-ring: ${focusRing}\``);
      lines.push("");
      lines.push(
        "Applied to interactive elements on `:focus`. Creates a 2px app-background gap + 4px brand-colored ring.",
      );
    }
    lines.push("");
    lines.push("### Reduced Motion");
    lines.push("");
    lines.push("When `prefers-reduced-motion: reduce` is set:");
    lines.push(
      "- All animations and transitions are disabled (duration → 0.01ms)",
    );
    lines.push("- `scroll-behavior` set to `auto`");
    lines.push("");

    // --- COMPONENTS ---
    if (componentRules.length > 0) {
      lines.push("## Components");
      lines.push("");
      lines.push("Extracted from CSS rules. Values shown as resolved tokens.");
      lines.push("");

      const componentMap = {};
      componentRules.forEach((rule) => {
        const base = rule.selector.split(/[:.\[\]\s>+~]/)[0] || rule.selector;
        if (!componentMap[base]) componentMap[base] = [];
        componentMap[base].push(rule);
      });

      const componentDescriptions = {
        ".btn":
          "Interactive buttons. Primary uses brand gradient, secondary is outlined, ghost is transparent. Sizes: sm (6px/14px), default (8px/20px), lg (12px/28px).",
        ".card":
          "Content containers with surface background, border, and shadow. Hover lifts with translateY(-2px) and stronger shadow.",
        ".input":
          "Text inputs with elevated background. Focus shows brand-colored border + focus ring. Error state uses red border.",
        ".badge":
          "Pill-shaped status indicators. Variants: brand, success, warning, error, info, purple. All use 10% alpha background + 30% alpha border.",
        ".alert":
          "System notifications with semantic colors. Padding 14px 20px, 12px radius, flex layout with 8px icon gap.",
        ".toggle":
          "Binary switch. 44×24px track, 20px knob. Off: border-strong bg. On: action-primary bg.",
        ".modal-overlay": "Full-screen backdrop with blur. Z-index 100.",
        ".modal-content":
          "Modal dialog. Surface bg, 16px radius, 2rem padding, max-width 480px, shadow-2xl.",
        table:
          "Data tables. Header: uppercase 0.7rem muted text. Rows: 14px text, subtle hover bg.",
        ".progress-track":
          "Progress bar track. 6px height, elevated bg, sm radius.",
        ".toast":
          "Notification popup. Surface bg, lg radius, xl shadow, 14px text.",
      };

      for (const [component, rules] of Object.entries(componentMap)) {
        lines.push(`### ${component}`);
        lines.push("");

        const desc = componentDescriptions[component];
        if (desc) {
          lines.push(`**Role:** ${desc}`);
          lines.push("");
        }

        const baseRule = rules.find((r) => r.selector === component);
        if (baseRule) {
          lines.push("| Property | Value |");
          lines.push("|----------|-------|");
          baseRule.properties.forEach((prop) => {
            lines.push(`| ${prop.property} | \`${prop.value}\` |`);
          });
          lines.push("");
        }

        const variants = rules.filter((r) => r.selector !== component);
        if (variants.length > 0) {
          lines.push("**Variants & States:**");
          lines.push("");
          for (const variant of variants) {
            lines.push(`\`${variant.selector}\``);
            lines.push("");
            lines.push("| Property | Value |");
            lines.push("|----------|-------|");
            variant.properties.forEach((prop) => {
              lines.push(`| ${prop.property} | \`${prop.value}\` |`);
            });
            lines.push("");
          }
        }
      }
    }

    // --- DO'S AND DON'TS ---
    lines.push("## Do's and Don'ts");
    lines.push("");
    lines.push("### Do");
    lines.push("- Use OKLCH color space for all colors");
    lines.push(
      "- Reference semantic tokens (`--bg-app`, `--text-primary`) instead of primitives",
    );
    lines.push(
      "- Use Plus Jakarta Sans for headings, Inter for body, Fira Code for code",
    );
    lines.push("- Keep spacing on the 4px grid");
    lines.push(
      "- Use 8px radius for buttons/inputs, 12px for cards, 16px for modals",
    );
    lines.push(
      "- Apply shadows from the elevation scale (`--shadow-xs` → `--shadow-2xl`)",
    );
    lines.push(
      "- Support both dark and light themes via `data-theme` attribute",
    );
    lines.push("- Respect `prefers-reduced-motion` for animations");
    lines.push("- Use `--focus-ring` for keyboard navigation indicators");
    lines.push("");
    lines.push("### Don't");
    lines.push("- Do not hardcode hex colors — use OKLCH tokens");
    lines.push("- Do not mix font families within a component");
    lines.push("- Do not use spacing values not divisible by 4");
    lines.push(
      "- Do not use border radius above 20px (except `--radius-full`)",
    );
    lines.push("- Do not apply shadows to flat elements (badges, tags)");
    lines.push("- Do not bypass semantic tokens to use primitives directly");
    lines.push(
      "- Do not use status colors (success/error) for decorative purposes",
    );
    lines.push("");

    // --- SURFACES ---
    lines.push("## Surfaces");
    lines.push("");
    lines.push("| Level | Token | Value | Purpose |");
    lines.push("|-------|-------|-------|---------|");

    const surfaceOrder = ["bg-app", "bg-surface", "bg-elevated", "bg-overlay"];
    const surfacePurposes = {
      "bg-app": "Page-level background (level 0)",
      "bg-surface": "Card and container backgrounds (level 1)",
      "bg-elevated": "Interactive elements, inputs (level 2)",
      "bg-overlay": "Modal and dropdown overlays (level 3)",
    };

    surfaceOrder.forEach((name, idx) => {
      const entry = tokens.get(name);
      if (entry) {
        lines.push(
          `| ${idx} | \`--${name}\` | \`${entry.value}\` | ${surfacePurposes[name] || "—"} |`,
        );
      }
    });
    lines.push("");

    // --- LAYOUT ---
    lines.push("## Layout");
    lines.push("");

    const layoutTokens = [
      ["Sidebar width", "size-sidebar-width"],
      ["Sidebar logo", "size-sidebar-logo"],
      ["Section icon", "size-section-icon"],
      ["Modal max-width", "size-modal-max-w"],
      ["Modal width", "size-modal-width"],
      ["Toggle size", "size-toggle-w × size-toggle-h"],
      ["Progress height", "size-progress-h"],
      ["Section gap", "space-16"],
      ["Card padding", "space-card-padding"],
      ["Content max-width", "900px (from layout.css)"],
    ];

    for (const [label, tokenKey] of layoutTokens) {
      if (tokenKey.includes("×")) {
        const w = tokens.get("size-toggle-w")?.value || "—";
        const h = tokens.get("size-toggle-h")?.value || "—";
        lines.push(`- **${label}:** ${w} × ${h}`);
      } else {
        const entry = tokens.get(tokenKey);
        const value = entry ? entry.value : tokenKey;
        lines.push(`- **${label}:** ${value}`);
      }
    }
    lines.push("");

    // --- AGENT PROMPT GUIDE ---
    lines.push("## Agent Prompt Guide");
    lines.push("");
    lines.push("**Quick Color Reference**");
    lines.push(`- Primary accent: \`${brandColor}\``);
    lines.push(`- Secondary accent: \`${accentColor}\``);
    lines.push(`- Background: \`${bgApp}\``);
    lines.push(`- Surface: \`${tokens.get("bg-surface")?.value || "—"}\``);
    lines.push(`- Elevated: \`${tokens.get("bg-elevated")?.value || "—"}\``);
    lines.push(
      `- Text primary: \`${tokens.get("text-primary")?.value || "—"}\``,
    );
    lines.push(
      `- Text secondary: \`${tokens.get("text-secondary")?.value || "—"}\``,
    );
    lines.push(`- Border: \`${tokens.get("border-default")?.value || "—"}\``);
    lines.push(`- Focus ring: \`${tokens.get("focus-ring")?.value || "—"}\``);
    lines.push("");
    lines.push("**Example Component Prompts**");
    lines.push("");

    const primaryBtnBg =
      tokens.get("button-primary-bg")?.value ||
      tokens.get("gradient-brand")?.value ||
      "—";
    const primaryBtnText = tokens.get("button-primary-text")?.value || "—";
    lines.push(
      `1. **Primary button:** background \`${primaryBtnBg}\`, text \`${primaryBtnText}\`, Inter 14px/600, 12px radius, 8px 20px padding. Hover: translateY(-1px) + shadow-md.`,
    );
    lines.push("");

    const cardBg = tokens.get("card-bg")?.value || "—";
    const cardBorder = tokens.get("card-border")?.value || "—";
    const cardRadius = tokens.get("card-radius")?.value || "—";
    const cardPadding = tokens.get("space-card-padding")?.value || "—";
    lines.push(
      `2. **Card:** background \`${cardBg}\`, border 1px \`${cardBorder}\`, ${cardRadius} radius, ${cardPadding} padding. Hover: border-color → border-strong, translateY(-2px), shadow-lg.`,
    );
    lines.push("");

    const inputBg = tokens.get("input-bg")?.value || "—";
    const inputBorder = tokens.get("input-border")?.value || "—";
    const inputFocus = tokens.get("input-border-focus")?.value || "—";
    const inputRadius = tokens.get("input-radius")?.value || "—";
    lines.push(
      `3. **Text input:** background \`${inputBg}\`, border 1px \`${inputBorder}\`, ${inputRadius} radius, 12px 16px padding. Focus: border → \`${inputFocus}\` + focus-ring. Error: border → border-error.`,
    );
    lines.push("");

    const badgeRadius = tokens.get("badge-radius")?.value || "—";
    lines.push(
      `4. **Badge:** pill shape (${badgeRadius} radius), 4px 12px padding, 12px/600 text. Variants use 10% alpha bg + 30% alpha border of semantic color.`,
    );
    lines.push("");

    const alertRadius = tokens.get("alert-radius")?.value || "—";
    lines.push(
      `5. **Alert:** ${alertRadius} radius, 14px 20px padding, flex with 8px icon gap. Background/text/border from semantic status tokens (info/success/warning/error).`,
    );
    lines.push("");

    // --- QUICK START ---
    lines.push("## Quick Start");
    lines.push("");
    lines.push("### CSS Custom Properties");
    lines.push("");
    lines.push("```css");
    lines.push(":root {");
    lines.push("  /* Brand */");
    lines.push(`  --color-brand-500: ${brandColor};`);
    lines.push(`  --color-accent-500: ${accentColor};`);
    lines.push("");
    lines.push("  /* Semantic */");
    lines.push(`  --bg-app: ${bgApp};`);
    lines.push(`  --bg-surface: ${tokens.get("bg-surface")?.value || "—"};`);
    lines.push(`  --bg-elevated: ${tokens.get("bg-elevated")?.value || "—"};`);
    lines.push(
      `  --text-primary: ${tokens.get("text-primary")?.value || "—"};`,
    );
    lines.push(
      `  --text-secondary: ${tokens.get("text-secondary")?.value || "—"};`,
    );
    lines.push(
      `  --border-default: ${tokens.get("border-default")?.value || "—"};`,
    );
    lines.push(
      `  --action-primary: ${tokens.get("action-primary")?.value || "—"};`,
    );
    lines.push("");
    lines.push("  /* Typography */");
    lines.push(
      `  --font-display: ${tokens.get("font-display")?.value || "'Plus Jakarta Sans', sans-serif"};`,
    );
    lines.push(
      `  --font-body: ${tokens.get("font-body")?.value || "'Inter', sans-serif"};`,
    );
    lines.push(
      `  --font-mono: ${tokens.get("font-mono")?.value || "'Fira Code', monospace"};`,
    );
    lines.push("");
    lines.push("  /* Spacing */");
    lines.push(`  --space-4: ${tokens.get("space-4")?.value || "16px"};`);
    lines.push(`  --space-6: ${tokens.get("space-6")?.value || "24px"};`);
    lines.push("");
    lines.push("  /* Radius */");
    lines.push(`  --radius-md: ${tokens.get("radius-md")?.value || "8px"};`);
    lines.push(`  --radius-lg: ${tokens.get("radius-lg")?.value || "12px"};`);
    lines.push(`  --radius-xl: ${tokens.get("radius-xl")?.value || "16px"};`);
    lines.push("");
    lines.push("  /* Shadows */");
    lines.push(`  --shadow-md: ${tokens.get("shadow-md")?.value || "—"};`);
    lines.push("");
    lines.push("  /* Motion */");
    lines.push(
      `  --duration-normal: ${tokens.get("duration-normal")?.value || "0.2s"};`,
    );
    lines.push(
      `  --ease-default: ${tokens.get("ease-default")?.value || "ease"};`,
    );
    lines.push("}");
    lines.push("```");

    return lines.join("\n");
  }

  // ===== 8. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

  function renderColorGroup(lines, title, description, items) {
    if (items.length === 0) return;

    const hues = items.map((i) => getHue(i.value)).filter((h) => h !== null);
    const uniqueHues = [...new Set(hues)];
    const hueStr =
      uniqueHues.length === 1 && uniqueHues[0] !== null
        ? ` (Hue ${uniqueHues[0]}°)`
        : "";

    lines.push(`### ${title}${hueStr}`);
    lines.push("");
    lines.push(`> ${description}`);
    lines.push("");
    lines.push("| Name | OKLCH | Token |");
    lines.push("|------|-------|-------|");
    items.forEach((item) => {
      const shortName = item.name.replace("color-", "");
      lines.push(`| ${shortName} | \`${item.value}\` | \`--${item.name}\` |`);
    });
    lines.push("");
  }

  function renderSemanticGroup(lines, title, items) {
    if (items.length === 0) return;
    lines.push(`**${title}**`);
    lines.push("");
    lines.push("| Token | Value |");
    lines.push("|-------|-------|");
    items.forEach((item) => {
      lines.push(`| \`--${item.name}\` | \`${item.value}\` |`);
    });
    lines.push("");
  }

  function renderMotionGroup(lines, title, items) {
    if (items.length === 0) return;
    lines.push(`### ${title}`);
    lines.push("");
    lines.push("| Token | Value |");
    lines.push("|-------|-------|");
    items.forEach((item) => {
      lines.push(`| \`--${item.name}\` | \`${item.value}\` |`);
    });
    lines.push("");
  }

  function findDifferences(defaultMap, otherMap) {
    const diffs = [];
    for (const [name, entry] of otherMap) {
      const defaultEntry = defaultMap.get(name);
      if (defaultEntry && defaultEntry.value !== entry.value) {
        diffs.push({
          name,
          darkValue: defaultEntry.value,
          lightValue: entry.value,
        });
      }
    }
    return diffs;
  }

  function getHue(value) {
    if (!value.startsWith("oklch(")) return null;
    const inner = value.slice(6, -1).trim();
    const withoutAlpha = inner.split("/")[0].trim();
    const parts = withoutAlpha.split(/\s+/);
    if (parts.length < 3) return null;
    const hue = parseFloat(parts[2]);
    return isNaN(hue) ? null : Math.round(hue);
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});

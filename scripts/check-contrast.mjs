// Checks WCAG contrast for the colour tokens in src/index.css, in both themes.
//   node scripts/check-contrast.mjs        (exits 1 if a required pair fails)
//
// Text pairs must reach 4.5:1 (AA). Graphical pairs (icons, rating stars, focus ring) must reach 3:1.

import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");

function block(selector) {
  const start = css.indexOf(selector + " {");
  const end = css.indexOf("\n  }", start);
  const body = css.slice(start, end);
  const vars = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g)) {
    vars[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return vars;
}

function hslToRgb([h, s, l]) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hsl) => { const [r, g, b] = hslToRgb(hsl).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [foreground token, background token, minimum ratio, note]
const PAIRS = [
  ["foreground", "background", 4.5], ["foreground", "card", 4.5], ["foreground", "surface-2", 4.5], ["foreground", "surface-3", 4.5],
  ["muted-foreground", "background", 4.5], ["muted-foreground", "card", 4.5], ["muted-foreground", "surface-2", 4.5], ["muted-foreground", "surface-3", 4.5],
  ["subtle-foreground", "background", 4.5], ["subtle-foreground", "card", 4.5],
  ["primary-foreground", "primary", 4.5], ["primary-foreground", "primary-hover", 4.5],
  ["primary-text", "background", 4.5], ["primary-text", "card", 4.5], ["primary-text", "surface-2", 4.5], ["primary-text", "primary-subtle", 4.5],
  ["success-text", "background", 4.5], ["success-text", "success-subtle", 4.5], ["success-foreground", "success", 4.5],
  ["destructive-text", "background", 4.5], ["destructive-text", "destructive-subtle", 4.5], ["destructive-foreground", "destructive", 4.5],
  ["warning-text", "background", 4.5], ["warning-text", "warning-subtle", 4.5], ["warning-foreground", "warning", 4.5],
  ["rating", "background", 3], ["rating", "card", 3],
  ["ring", "background", 3], ["ring", "card", 3],
  ["input", "background", 1.5, "field outline (informational)"],
];

let failed = 0;
for (const [name, sel] of [["light", ":root"], ["dark", ".dark"]]) {
  const t = { ...block(":root"), ...(sel === ".dark" ? block(".dark") : {}) };
  console.log(`\n${name.toUpperCase()}`);
  for (const [fg, bg, min, note] of PAIRS) {
    if (!t[fg] || !t[bg]) { console.log(`  ?  ${fg} / ${bg}: token missing`); failed++; continue; }
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`  ${ok ? "ok" : "XX"}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${fg} on ${bg}${note ? "  - " + note : ""}`);
  }
}
console.log(failed ? `\n${failed} pair(s) below target` : "\nAll pairs meet their targets");
process.exit(failed ? 1 : 0);

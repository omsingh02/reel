// Bundles the MCP server into one self-contained file for Supabase Edge Functions.
//
//   node scripts/build-mcp.mjs   ->   supabase/functions/mcp/dist/index.js
//
// Why: the generated supabase/functions/mcp/index.ts imports `npm:@lovable.dev/mcp-js`, whose
// dependency tree (the full MCP SDK, esbuild, ...) makes Supabase's bundler produce ~26 MB, over
// the platform's upload limit. Bundling and tree-shaking ourselves ships only the code we use.
//
// The project ref is baked in as the OAuth issuer, so it must be known at build time:
// VITE_SUPABASE_PROJECT_ID from the environment, or from .env.

import { build } from "esbuild";
import { builtinModules, createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

function readEnvFile(name) {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    const m = readFileSync(file, "utf8").match(new RegExp(`^\\s*${name}\\s*=\\s*"?([^"\\r\\n#]+?)"?\\s*$`, "m"));
    if (m) return m[1];
  }
}

const projectRef = process.env.VITE_SUPABASE_PROJECT_ID || readEnvFile("VITE_SUPABASE_PROJECT_ID");
if (!projectRef) {
  console.error("VITE_SUPABASE_PROJECT_ID is not set (environment or .env); it becomes the OAuth issuer.");
  process.exit(1);
}

const root = process.cwd();
const outfile = resolve(root, "supabase/functions/mcp/dist/index.js");
mkdirSync(resolve(root, "supabase/functions/mcp/dist"), { recursive: true });

// Deno only accepts built-ins with the `node:` prefix.
const builtins = new Set(builtinModules.filter((m) => !m.startsWith("_")));
const nodePrefix = {
  name: "node-prefix-builtins",
  setup(b) {
    b.onResolve({ filter: /^[a-z_/]+$/ }, (args) =>
      builtins.has(args.path) ? { path: `node:${args.path}`, external: true } : null
    );
    b.onResolve({ filter: /^node:/ }, (args) => ({ path: args.path, external: true }));
  },
};

await build({
  stdin: {
    contents: `
      import mcp from "./src/lib/mcp/index.ts";
      import { createSupabaseHandler } from "@lovable.dev/mcp-js/stacks/supabase";
      Deno.serve(createSupabaseHandler(mcp, { functionName: "mcp" }));
    `,
    resolveDir: root,
    sourcefile: "mcp-entry.ts",
    loader: "ts",
  },
  outfile,
  bundle: true,
  format: "esm",
  platform: "node",
  target: "es2022",
  minify: true,
  legalComments: "none",
  conditions: ["import", "node"],
  define: { "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(projectRef) },
  plugins: [nodePrefix],
  // Some dependencies are CommonJS and call require(); give the ESM bundle a working one.
  banner: { js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);' },
  logLevel: "info",
});

const kb = Math.round(statSync(outfile).size / 1024);
console.log(`mcp bundle: ${kb} KB (issuer https://${projectRef}.supabase.co/auth/v1)`);

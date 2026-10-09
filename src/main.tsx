import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ConfigError } from "./components/ConfigError.tsx";
import "./index.css";

// The generated Supabase client throws at import time if these are missing, which would
// leave a blank page. Check first, and load the app (and the client) only when they're set.
const REQUIRED_ENV = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;
const missing = REQUIRED_ENV.filter((name) => !import.meta.env[name]);

const root = createRoot(document.getElementById("root")!);

if (missing.length > 0) {
  root.render(<ConfigError missing={[...missing]} />);
} else {
  import("./App.tsx")
    .then(({ default: App }) =>
      root.render(
        <HelmetProvider>
          <App />
        </HelmetProvider>
      )
    )
    .catch((error) => {
      console.error("[Reel] failed to load the app", error);
      root.render(<ConfigError loadFailed />);
    });
}

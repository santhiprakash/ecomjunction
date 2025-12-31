import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeSecurity } from "./utils/security.ts";
import { initializeAnalytics } from "./lib/analytics.ts";

// Initialize security measures
initializeSecurity();

// Initialize Google Analytics (if configured)
initializeAnalytics();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

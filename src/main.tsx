import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import App from "./App";
import "./index.css";

// Add error handler for uncaught errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', message, source, lineno, colno, error);
  document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Error</h1><pre>${message}\n${source}:${lineno}</pre></div>`;
  return false;
};

// Add handler for unhandled promise rejections
window.onunhandledrejection = function(event) {
  console.error('Unhandled rejection:', event.reason);
};

try {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('Render error:', error);
  document.body.innerHTML = `<div style="color: red; padding: 20px;"><h1>Render Error</h1><pre>${error}</pre></div>`;
}

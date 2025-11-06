/**
 * main.jsx
 *
 * Application entry point - initializes and mounts the React application.
 * This file is the first JavaScript file executed when the app loads.
 *
 * Purpose:
 * - Creates the React root element
 * - Mounts the App component to the DOM
 * - Wraps app in StrictMode for additional development checks
 * - Imports global CSS styles
 *
 * Flow:
 * 1. Import React core and rendering functions
 * 2. Import global stylesheets (Tailwind CSS via index.css)
 * 3. Import root App component
 * 4. Find the DOM element with id="root" in index.html
 * 5. Create React root and render App inside StrictMode
 *
 * StrictMode Benefits:
 * - Identifies components with unsafe lifecycles
 * - Warns about legacy string ref API usage
 * - Warns about deprecated findDOMNode usage
 * - Detects unexpected side effects
 * - Ensures reusable state
 *
 * Note: StrictMode only runs in development, not production
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

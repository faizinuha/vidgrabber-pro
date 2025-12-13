import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import React from "react";

// // auto update
// import { CapacitorUpdater } from "@capgo/capacitor-updater";

// CapacitorUpdater.notifyAppReady();


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// auto update
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import React from "react";

CapacitorUpdater.notifyAppReady();


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

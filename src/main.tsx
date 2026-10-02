import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LangProvider } from "./i18n/LangContext";
import "./index.css";

const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
if (domain) {
  const s = document.createElement("script");
  s.defer = true; s.dataset.domain = domain; s.src = "https://plausible.io/js/script.js";
  document.head.appendChild(s);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><BrowserRouter><LangProvider><App /></LangProvider></BrowserRouter></React.StrictMode>
);

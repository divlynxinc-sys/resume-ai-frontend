/**
 * Dev-only proctoring sandbox entry — `npm run dev` then open /proctor-sandbox.html.
 *
 * Vite only builds `index.html`, so this never reaches a production bundle and is
 * not in the app's route table. Delete `proctor-sandbox.html` + `src/dev/` to drop it.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@/index.css";
import { Sandbox } from "./proctor-sandbox-ui";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Sandbox />
    </BrowserRouter>
  </StrictMode>,
);

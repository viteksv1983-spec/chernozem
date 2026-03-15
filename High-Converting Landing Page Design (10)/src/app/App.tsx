import { RouterProvider } from "react-router";
import { ContentProvider } from "./contexts/ContentContext";
import { router } from "./routes";
// Run at module-parse time — injects font preconnect + stylesheet
// before React renders, eliminating font-load delay (FOUT / CLS).
import "./lib/critical";
import "../styles/fonts.css";

export default function App() {
  return (
    <ContentProvider>
      <RouterProvider router={router} />
    </ContentProvider>
  );
}
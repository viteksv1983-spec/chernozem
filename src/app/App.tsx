import { RouterProvider } from "react-router";
import { ContentProvider } from "./contexts/ContentContext";
import { router } from "./routes";
import "../styles/fonts.css";

export default function App() {
  return (
    <ContentProvider>
      <RouterProvider router={router} />
    </ContentProvider>
  );
}
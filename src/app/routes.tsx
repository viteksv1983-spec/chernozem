import { createBrowserRouter } from "react-router";
import { routeConfig } from "./routeConfig";

export const router = createBrowserRouter(routeConfig, {
  basename: import.meta.env.BASE_URL,
});
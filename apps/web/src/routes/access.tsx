import { createFileRoute } from "@tanstack/react-router";
import { BackofficePage } from "../pages/backoffice/backoffice.page.js";

export const Route = createFileRoute("/access")({ component: BackofficePage });

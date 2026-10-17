import { createFileRoute } from "@tanstack/react-router";
import { CompanyProfilePage } from "../pages/companyProfile/companyProfile.page.js";

export const Route = createFileRoute("/")({ component: CompanyProfilePage });

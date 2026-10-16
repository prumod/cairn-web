import { HeadContent, createRootRoute, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppLayout } from "../AppLayout.js";
import "../style.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cairn | Perfil da empresa" },
    ],
  }),
  component: AppLayout,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

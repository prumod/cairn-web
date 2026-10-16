import express from "express";
import { sql } from "drizzle-orm";
import type { ErrorRequestHandler } from "express";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { getAccess, changeApproval, listUsers } from "./modules/access/access.js";
import type { Auth } from "./shared/auth/auth.js";
import {
  getCompanyProfile,
  saveCompanyProfile,
  parseCompanyProfile,
} from "./modules/company/profile.js";
import type { Database } from "./shared/database/database.js";

export type ApplicationOptions = {
  db: Database;
  auth: Auth;
  origin: string;
  bootstrapEmail: string;
  staticDirectory?: string;
  revision?: string;
};
export function createApplication(options: ApplicationOptions) {
  const app = express();
  app.disable("x-powered-by");
  app.get("/healthz", async (_req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      await options.db.execute(sql`SELECT 1`);
      res.json({ status: "ready", revision: options.revision ?? "local" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });
  app.all("/api/auth/{*path}", toNodeHandler(options.auth));
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && req.get("origin") !== options.origin) {
      res.status(403).json({ error: "Same-origin request required." });
      return;
    }
    next();
  });
  app.use(express.json({ limit: "8kb" }));
  app.get("/api/me", async (req, res) => {
    const session = await options.auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      res.json(null);
      return;
    }
    const access = await getAccess(options.db, session.user.id, options.bootstrapEmail);
    res.json({
      id: session.user.id,
      email: session.user.email,
      approved: access.approved,
      administrator: access.administrator,
    });
  });
  app.get("/api/users", async (req, res) => {
    const session = await options.auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      res.status(401).json({ error: "Sign in required." });
      return;
    }
    const access = await getAccess(options.db, session.user.id, options.bootstrapEmail);
    if (!access.administrator || !access.approved) {
      res.status(403).json({ error: "Administrator access required." });
      return;
    }
    res.json(await listUsers(options.db));
  });
  app.put("/api/users/:userId/access", async (req, res) => {
    const session = await options.auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      res.status(401).json({ error: "Sign in required." });
      return;
    }
    const access = await getAccess(options.db, session.user.id, options.bootstrapEmail);
    if (!access.administrator || !access.approved) {
      res.status(403).json({ error: "Administrator access required." });
      return;
    }
    if (typeof req.body?.approved !== "boolean") {
      res.status(400).json({ error: "Approval must be true or false." });
      return;
    }
    if (req.params.userId === session.user.id) {
      res.status(400).json({ error: "You cannot change your own access." });
      return;
    }
    const updated = await changeApproval(options.db, req.params.userId, req.body.approved);
    if (!updated) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.json({ approved: req.body.approved });
  });
  app.get("/api/company-profile", async (req, res) => {
    const session = await options.auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      res.status(401).json({ error: "Sign in required." });
      return;
    }
    const access = await getAccess(options.db, session.user.id, options.bootstrapEmail);
    if (!access.approved) {
      res.status(403).json({ error: "Account awaits approval." });
      return;
    }
    res.json(await getCompanyProfile(options.db));
  });
  app.put("/api/company-profile", async (req, res) => {
    const session = await options.auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      res.status(401).json({ error: "Sign in required." });
      return;
    }
    const access = await getAccess(options.db, session.user.id, options.bootstrapEmail);
    if (!access.approved) {
      res.status(403).json({ error: "Account awaits approval." });
      return;
    }
    const profile = parseCompanyProfile(req.body);
    if (!profile) {
      res
        .status(400)
        .json({ error: "Name and address are required; radius must be a positive number." });
      return;
    }
    res.json(await saveCompanyProfile(options.db, profile));
  });
  app.all("/api/{*path}", (_req, res) => {
    res.status(404).json({ error: "Not found." });
  });
  if (options.staticDirectory) {
    const directory = options.staticDirectory;
    app.use(express.static(directory));
    app.get(["/", "/access"], (_req, res) => {
      res.sendFile("index.html", { root: directory });
    });
  }
  const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: "Invalid JSON." });
      return;
    }
    console.error("Request failed.");
    res.status(500).json({ error: "Request failed. Try again." });
  };
  app.use(handleError);
  return app;
}

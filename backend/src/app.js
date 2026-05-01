// src/app.js  — drop-in replacement for the original
import cookieParser from "cookie-parser";
import express from "express";

// existing
import authRoute from "./modules/auth/auth.routes.js";

// new modules
import projectRoute from "./modules/projects/project.routes.js";
import taskRoute from "./modules/tasks/task.routes.js";
import dashboardRoute from "./modules/dashboard/dashboard.routes.js";

import ApiError from "./common/utils/api-error.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// ─── routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoute);
app.use("/api/projects", projectRoute);

// Tasks nested under projects:  GET /api/projects/:projectId/tasks
// Tasks also accessible directly: GET /api/tasks/:taskId
app.use("/api/projects/:projectId/tasks", taskRoute);
app.use("/api/tasks", taskRoute);

app.use("/api/dashboard", dashboardRoute);

// ─── global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, message });
});

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

export default app;

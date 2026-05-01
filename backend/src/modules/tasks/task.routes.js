import { Router } from "express";
import * as controller from "./task.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import validate from "../../common/middleware/validate.middleware.js";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto.js";

// mergeParams: true lets us access :projectId from the parent router
const router = Router({ mergeParams: true });

router.use(authenticate);

// GET    /api/projects/:projectId/tasks           — list with filters & pagination
// POST   /api/projects/:projectId/tasks           — create task
router.get("/", controller.getProjectTasks);
router.post("/", validate(CreateTaskDto), controller.createTask);

// GET    /api/tasks/:taskId                       — get single task
// PATCH  /api/tasks/:taskId                       — update task
// DELETE /api/tasks/:taskId                       — delete task
// (mounted separately at /api/tasks for standalone task access)
router.get("/:taskId", controller.getTaskById);
router.patch("/:taskId", validate(UpdateTaskDto), controller.updateTask);
router.delete("/:taskId", controller.deleteTask);

export default router;

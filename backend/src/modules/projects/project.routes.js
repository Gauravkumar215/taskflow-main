import { Router } from "express";
import * as controller from "./project.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import validate from "../../common/middleware/validate.middleware.js";
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from "./dto/project.dto.js";

const router = Router();

// All project routes require authentication
router.use(authenticate);

// ─── project CRUD ─────────────────────────────────────────────────────────────
router.post("/", validate(CreateProjectDto), controller.createProject);
router.get("/", controller.getMyProjects);
router.get("/:projectId", controller.getProjectById);
router.patch("/:projectId", validate(UpdateProjectDto), controller.updateProject);
router.delete("/:projectId", controller.deleteProject);

// ─── member management ────────────────────────────────────────────────────────
// POST   /api/projects/:projectId/members          — add a member  (admin only)
// PATCH  /api/projects/:projectId/members/:memberId — update role  (admin only)
// DELETE /api/projects/:projectId/members/:memberId — remove       (admin | self)
router.post(
  "/:projectId/members",
  validate(AddMemberDto),
  controller.addMember,
);
router.patch(
  "/:projectId/members/:memberId",
  validate(UpdateMemberRoleDto),
  controller.updateMemberRole,
);
router.delete("/:projectId/members/:memberId", controller.removeMember);

export default router;

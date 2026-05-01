import * as projectService from "./project.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const createProject = async (req, res) => {
  const project = await projectService.createProject(req.body, req.user.id);
  ApiResponse.created(res, "Project created successfully", project);
};

const getMyProjects = async (req, res) => {
  const projects = await projectService.getMyProjects(req.user.id);
  ApiResponse.ok(res, "Projects retrieved", projects);
};

const getProjectById = async (req, res) => {
  const project = await projectService.getProjectById(
    req.params.projectId,
    req.user.id,
  );
  ApiResponse.ok(res, "Project retrieved", project);
};

const updateProject = async (req, res) => {
  const project = await projectService.updateProject(
    req.params.projectId,
    req.user.id,
    req.body,
  );
  ApiResponse.ok(res, "Project updated", project);
};

const deleteProject = async (req, res) => {
  await projectService.deleteProject(req.params.projectId, req.user.id);
  ApiResponse.ok(res, "Project deleted successfully");
};

// ─── member management ───────────────────────────────────────────────────────

const addMember = async (req, res) => {
  const project = await projectService.addMember(
    req.params.projectId,
    req.user.id,
    req.body,
  );
  ApiResponse.ok(res, "Member added successfully", project);
};

const updateMemberRole = async (req, res) => {
  const project = await projectService.updateMemberRole(
    req.params.projectId,
    req.user.id,
    req.params.memberId,
    req.body.role,
  );
  ApiResponse.ok(res, "Member role updated", project);
};

const removeMember = async (req, res) => {
  await projectService.removeMember(
    req.params.projectId,
    req.user.id,
    req.params.memberId,
  );
  ApiResponse.ok(res, "Member removed successfully");
};

export {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  updateMemberRole,
  removeMember,
};

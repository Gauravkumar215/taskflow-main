import mongoose from "mongoose";
import Project from "./project.model.js";
import User from "../auth/auth.model.js";
import ApiError from "../../common/utils/api-error.js";

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Resolve a project and assert the requesting user is a member.
 * Returns { project, role } where role is "admin" | "member".
 */
const resolveProjectForMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw ApiError.notFound("Project not found");

  const role = project.getMemberRole(userId);
  if (!role) throw ApiError.forbidden("You are not a member of this project");

  return { project, role };
};

/**
 * Same as above but also asserts the user has admin role in the project.
 */
const resolveProjectForAdmin = async (projectId, userId) => {
  const { project, role } = await resolveProjectForMember(projectId, userId);
  if (role !== "admin")
    throw ApiError.forbidden("Only project admins can perform this action");
  return project;
};

// ─── project CRUD ────────────────────────────────────────────────────────────

/**
 * Create a new project. The creator becomes owner (and implicit admin).
 */
const createProject = async ({ name, description }, ownerId) => {
  const project = await Project.create({
    name,
    description,
    owner: ownerId,
    members: [], // owner is tracked separately
  });

  return project.populate("owner", "name email");
};

/**
 * List all projects the requesting user belongs to (as owner or member).
 */
const getMyProjects = async (userId) => {
  const projects = await Project.find({
    $or: [{ owner: userId }, { "members.user": userId }],
  })
    .populate("owner", "name email")
    .populate("members.user", "name email")
    .sort({ updatedAt: -1 });

  return projects;
};

/**
 * Get a single project by id. Only members can view it.
 */
const getProjectById = async (projectId, userId) => {
  const { project } = await resolveProjectForMember(projectId, userId);
  await project.populate("owner", "name email");
  await project.populate("members.user", "name email");
  return project;
};

/**
 * Update project metadata. Only project admins can do this.
 */
const updateProject = async (projectId, userId, updates) => {
  const project = await resolveProjectForAdmin(projectId, userId);

  Object.assign(project, updates);
  await project.save();

  await project.populate("owner", "name email");
  await project.populate("members.user", "name email");
  return project;
};

/**
 * Delete a project. Only the project owner can delete it.
 */
const deleteProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw ApiError.notFound("Project not found");

  if (project.owner.toString() !== userId.toString()) {
    throw ApiError.forbidden("Only the project owner can delete this project");
  }

  await project.deleteOne();
};

// ─── member management ───────────────────────────────────────────────────────

/**
 * Add a user to the project. Only project admins can invite.
 * The user being added must exist in the system.
 */
const addMember = async (projectId, adminId, { userId, role }) => {
  const project = await resolveProjectForAdmin(projectId, adminId);

  // Verify the target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) throw ApiError.notFound("User not found");

  // Prevent owner from being re-added
  if (project.owner.toString() === userId.toString()) {
    throw ApiError.conflict("User is already the project owner");
  }

  // Prevent duplicate membership
  const alreadyMember = project.members.some(
    (m) => m.user.toString() === userId.toString(),
  );
  if (alreadyMember) throw ApiError.conflict("User is already a project member");

  project.members.push({ user: userId, role });
  await project.save();

  await project.populate("owner", "name email");
  await project.populate("members.user", "name email");
  return project;
};

/**
 * Update the project-level role of an existing member.
 * Only project admins can do this. Cannot change owner's role.
 */
const updateMemberRole = async (projectId, adminId, memberId, role) => {
  const project = await resolveProjectForAdmin(projectId, adminId);

  if (project.owner.toString() === memberId.toString()) {
    throw ApiError.badRequest("Cannot change the owner's role");
  }

  const member = project.members.find(
    (m) => m.user.toString() === memberId.toString(),
  );
  if (!member) throw ApiError.notFound("Member not found in this project");

  member.role = role;
  await project.save();

  await project.populate("owner", "name email");
  await project.populate("members.user", "name email");
  return project;
};

/**
 * Remove a member from the project.
 * Admins can remove any member. Members can only remove themselves (leave).
 */
const removeMember = async (projectId, requesterId, memberId) => {
  const { project, role } = await resolveProjectForMember(projectId, requesterId);

  // Non-admins can only remove themselves
  if (role !== "admin" && requesterId.toString() !== memberId.toString()) {
    throw ApiError.forbidden("You can only remove yourself from the project");
  }

  if (project.owner.toString() === memberId.toString()) {
    throw ApiError.badRequest(
      "Cannot remove the project owner. Transfer ownership first.",
    );
  }

  const memberIndex = project.members.findIndex(
    (m) => m.user.toString() === memberId.toString(),
  );
  if (memberIndex === -1) throw ApiError.notFound("Member not found in this project");

  project.members.splice(memberIndex, 1);
  await project.save();
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

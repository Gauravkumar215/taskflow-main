import Task from "./task.model.js";
import Project from "../projects/project.model.js";
import ApiError from "../../common/utils/api-error.js";

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Resolve a project and assert the requesting user is a member.
 * Returns { project, role }.
 */
const resolveProjectForMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw ApiError.notFound("Project not found");

  const role = project.getMemberRole(userId);
  if (!role) throw ApiError.forbidden("You are not a member of this project");

  return { project, role };
};

/**
 * Assert that the assignee (if provided) is a member of the project.
 */
const assertAssigneeIsMember = (project, assignedTo) => {
  if (!assignedTo) return;
  if (!project.hasMember(assignedTo)) {
    throw ApiError.badRequest(
      "Assigned user is not a member of this project",
    );
  }
};

// ─── task CRUD ───────────────────────────────────────────────────────────────

/**
 * Create a task inside a project.
 * Any project member can create tasks.
 */
const createTask = async (projectId, userId, taskData) => {
  const { project } = await resolveProjectForMember(projectId, userId);

  if (taskData.assignedTo) {
    assertAssigneeIsMember(project, taskData.assignedTo);
  }

  const task = await Task.create({
    ...taskData,
    project: projectId,
    createdBy: userId,
  });

  return task
    .populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" },
    ]);
};

/**
 * List tasks in a project with optional filters and pagination.
 */
const getProjectTasks = async (projectId, userId, filters = {}) => {
  await resolveProjectForMember(projectId, userId);

  const {
    status,
    priority,
    assignedTo,
    overdue,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const query = { project: projectId };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (overdue === true) {
    query.dueDate = { $lt: new Date() };
    query.status = { $ne: "done" };
  }

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single task. The requester must be a project member.
 */
const getTaskById = async (taskId, userId) => {
  const task = await Task.findById(taskId)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("project", "name");

  if (!task) throw ApiError.notFound("Task not found");

  await resolveProjectForMember(task.project._id, userId);

  return task;
};

/**
 * Update a task.
 * - Project admins can update anything.
 * - The task creator can update anything.
 * - The assignee can only update the status field.
 */
const updateTask = async (taskId, userId, updates) => {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound("Task not found");

  const { project, role } = await resolveProjectForMember(task.project, userId);

  const isCreator = task.createdBy.toString() === userId.toString();
  const isAssignee =
    task.assignedTo && task.assignedTo.toString() === userId.toString();
  const isAdmin = role === "admin";

  // Non-admin, non-creator, assignees may only update status
  if (!isAdmin && !isCreator && isAssignee) {
    const disallowedKeys = Object.keys(updates).filter((k) => k !== "status");
    if (disallowedKeys.length > 0) {
      throw ApiError.forbidden(
        "Assignees can only update the task status",
      );
    }
  }

  // Purely observers (not admin, not creator, not assignee) cannot edit
  if (!isAdmin && !isCreator && !isAssignee) {
    throw ApiError.forbidden(
      "You do not have permission to update this task",
    );
  }

  if (updates.assignedTo) {
    assertAssigneeIsMember(project, updates.assignedTo);
  }

  Object.assign(task, updates);
  await task.save();

  await task.populate([
    { path: "assignedTo", select: "name email" },
    { path: "createdBy", select: "name email" },
  ]);

  return task;
};

/**
 * Delete a task.
 * Only project admins or the task creator can delete.
 */
const deleteTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound("Task not found");

  const { role } = await resolveProjectForMember(task.project, userId);

  const isCreator = task.createdBy.toString() === userId.toString();
  if (role !== "admin" && !isCreator) {
    throw ApiError.forbidden(
      "Only project admins or the task creator can delete this task",
    );
  }

  await task.deleteOne();
};

export { createTask, getProjectTasks, getTaskById, updateTask, deleteTask };

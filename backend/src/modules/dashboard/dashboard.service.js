import Task from "../tasks/task.model.js";
import Project from "../projects/project.model.js";
import ApiError from "../../common/utils/api-error.js";

/**
 * Return a dashboard summary for the authenticated user:
 *  - Projects they belong to
 *  - Task counts by status (global and per-project)
 *  - Overdue tasks
 *  - Tasks assigned to them
 */
const getDashboard = async (userId) => {
  // 1. Find all projects this user belongs to
  const projects = await Project.find({
    $or: [{ owner: userId }, { "members.user": userId }],
  })
    .populate("owner", "name email")
    .select("name status owner members createdAt");

  const projectIds = projects.map((p) => p._id);

  // 2. Task counts grouped by status (scoped to user's projects)
  const statusAggregation = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const tasksByStatus = { todo: 0, in_progress: 0, in_review: 0, done: 0 };
  statusAggregation.forEach(({ _id, count }) => {
    tasksByStatus[_id] = count;
  });

  // 3. Overdue tasks (due in past, not done)
  const now = new Date();
  const overdueTasks = await Task.find({
    project: { $in: projectIds },
    dueDate: { $lt: now },
    status: { $ne: "done" },
  })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("project", "name")
    .sort({ dueDate: 1 })
    .limit(20);

  // 4. Tasks specifically assigned to this user
  const myTasks = await Task.find({
    project: { $in: projectIds },
    assignedTo: userId,
    status: { $ne: "done" },
  })
    .populate("project", "name")
    .sort({ dueDate: 1, priority: -1 })
    .limit(20);

  // 5. Per-project task breakdown
  const perProjectBreakdown = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: { project: "$project", status: "$status" },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.project",
        statuses: {
          $push: { status: "$_id.status", count: "$count" },
        },
        total: { $sum: "$count" },
      },
    },
  ]);

  // Shape per-project data into a map keyed by projectId
  const projectTaskMap = {};
  perProjectBreakdown.forEach(({ _id, statuses, total }) => {
    const statusMap = { todo: 0, in_progress: 0, in_review: 0, done: 0 };
    statuses.forEach(({ status, count }) => {
      statusMap[status] = count;
    });
    projectTaskMap[_id.toString()] = { ...statusMap, total };
  });

  const projectsWithStats = projects.map((p) => ({
    ...p.toObject(),
    tasks: projectTaskMap[p._id.toString()] || {
      todo: 0,
      in_progress: 0,
      in_review: 0,
      done: 0,
      total: 0,
    },
  }));

  return {
    summary: {
      totalProjects: projects.length,
      totalTasks:
        tasksByStatus.todo +
        tasksByStatus.in_progress +
        tasksByStatus.in_review +
        tasksByStatus.done,
      tasksByStatus,
      overdueCount: overdueTasks.length,
      myOpenTasksCount: myTasks.length,
    },
    projects: projectsWithStats,
    overdueTasks,
    myTasks,
  };
};

export { getDashboard };

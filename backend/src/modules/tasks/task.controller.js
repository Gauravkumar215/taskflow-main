import * as taskService from "./task.service.js";
import ApiResponse from "../../common/utils/api-response.js";
import ApiError from "../../common/utils/api-error.js";
import { TaskFilterDto } from "./dto/task.dto.js";

const createTask = async (req, res) => {
  const task = await taskService.createTask(
    req.params.projectId,
    req.user.id,
    req.body,
  );
  ApiResponse.created(res, "Task created successfully", task);
};

const getProjectTasks = async (req, res) => {
  // Validate query params via TaskFilterDto
  const { errors, value: filters } = TaskFilterDto.validate(req.query);
  if (errors) throw ApiError.badRequest(errors.join("; "));

  const result = await taskService.getProjectTasks(
    req.params.projectId,
    req.user.id,
    filters,
  );
  ApiResponse.ok(res, "Tasks retrieved", result);
};

const getTaskById = async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, req.user.id);
  ApiResponse.ok(res, "Task retrieved", task);
};

const updateTask = async (req, res) => {
  const task = await taskService.updateTask(
    req.params.taskId,
    req.user.id,
    req.body,
  );
  ApiResponse.ok(res, "Task updated", task);
};

const deleteTask = async (req, res) => {
  await taskService.deleteTask(req.params.taskId, req.user.id);
  ApiResponse.ok(res, "Task deleted successfully");
};

export { createTask, getProjectTasks, getTaskById, updateTask, deleteTask };

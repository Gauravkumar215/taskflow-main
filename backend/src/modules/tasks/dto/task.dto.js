import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

export class CreateTaskDto extends BaseDto {
  static schema = Joi.object({
    title: Joi.string().trim().min(2).max(150).required(),
    description: Joi.string().trim().max(1000).allow("").default(""),
    assignedTo: Joi.string()
      .pattern(/^[a-f\d]{24}$/i)
      .message("assignedTo must be a valid MongoDB ObjectId")
      .allow(null)
      .default(null),
    status: Joi.string()
      .valid("todo", "in_progress", "in_review", "done")
      .default("todo"),
    priority: Joi.string()
      .valid("low", "medium", "high", "critical")
      .default("medium"),
    dueDate: Joi.date().iso().min("now").allow(null).default(null),
    tags: Joi.array()
      .items(Joi.string().trim().max(30))
      .max(10)
      .default([]),
  });
}

export class UpdateTaskDto extends BaseDto {
  static schema = Joi.object({
    title: Joi.string().trim().min(2).max(150),
    description: Joi.string().trim().max(1000).allow(""),
    assignedTo: Joi.string()
      .pattern(/^[a-f\d]{24}$/i)
      .allow(null),
    status: Joi.string().valid("todo", "in_progress", "in_review", "done"),
    priority: Joi.string().valid("low", "medium", "high", "critical"),
    dueDate: Joi.date().iso().allow(null),
    tags: Joi.array().items(Joi.string().trim().max(30)).max(10),
  }).min(1);
}

export class TaskFilterDto extends BaseDto {
  static schema = Joi.object({
    status: Joi.string().valid("todo", "in_progress", "in_review", "done"),
    priority: Joi.string().valid("low", "medium", "high", "critical"),
    assignedTo: Joi.string().pattern(/^[a-f\d]{24}$/i),
    overdue: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid("createdAt", "updatedAt", "dueDate", "priority")
      .default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  });

  // TaskFilterDto reads from req.query not req.body
  static validate(data) {
    const { error, value } = this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const errors = error.details.map((d) => d.message);
      return { errors, value: null };
    }
    return { errors: null, value };
  }
}

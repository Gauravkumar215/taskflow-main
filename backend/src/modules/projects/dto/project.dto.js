import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

export class CreateProjectDto extends BaseDto {
  static schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(500).allow("").default(""),
  });
}

export class UpdateProjectDto extends BaseDto {
  static schema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(500).allow(""),
    status: Joi.string().valid("active", "archived"),
  }).min(1); // at least one field required
}

export class AddMemberDto extends BaseDto {
  static schema = Joi.object({
    userId: Joi.string()
      .pattern(/^[a-f\d]{24}$/i)
      .message("userId must be a valid MongoDB ObjectId")
      .required(),
    role: Joi.string().valid("admin", "member").default("member"),
  });
}

export class UpdateMemberRoleDto extends BaseDto {
  static schema = Joi.object({
    role: Joi.string().valid("admin", "member").required(),
  });
}

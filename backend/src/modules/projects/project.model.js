import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [memberSchema],
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  { timestamps: true },
);

// Ensure a user can't appear in members more than once
projectSchema.index({ "members.user": 1 });

// Virtual: total member count (including owner)
projectSchema.virtual("memberCount").get(function () {
  return this.members.length + 1;
});

// Helper: check if a userId is the owner OR a member
projectSchema.methods.hasMember = function (userId) {
  const id = userId.toString();
  if (this.owner.toString() === id) return true;
  return this.members.some((m) => m.user.toString() === id);
};

// Helper: get a member's project-level role ("admin" | "member" | null)
projectSchema.methods.getMemberRole = function (userId) {
  const id = userId.toString();
  if (this.owner.toString() === id) return "admin";
  const member = this.members.find((m) => m.user.toString() === id);
  return member ? member.role : null;
};

export default mongoose.model("Project", projectSchema);

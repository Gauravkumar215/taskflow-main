import { Router } from "express";
import * as controller from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";
import validate from "../../common/middleware/validate.middleware.js";
import RegisterDto from "./dto/register.dto.js";
import LoginDto from "./dto/login.dto.js";
import ForgotPasswordDto from "./dto/forgot-password.dto.js";
import ResetPasswordDto from "./dto/reset-password.dto.js";
import { sendVerificationEmail } from "../../common/utils/email.js"; // adjust path if needed



const router = Router();

router.post("/register", validate(RegisterDto), controller.register);
router.post("/login", validate(LoginDto), controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", authenticate, controller.logout);
router.get("/verify-email/:token", controller.verifyEmail);
router.post(
  "/forgot-password",
  validate(ForgotPasswordDto),
  controller.forgotPassword,
);
router.put(
  "/reset-password/:token",
  validate(ResetPasswordDto),
  controller.resetPassword,
);
router.get("/me", authenticate, controller.getMe);

router.get("/users", authenticate, controller.getAllUsers);
router.get("/test-email", async (req, res) => {
  try {
    await sendVerificationEmail("admin@findzeroone.com", "testtoken123");
    res.json({ success: true, message: "Email sent!" });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message,
      code: err.code,
      response: err.response 
    });
  }
});
export default router;

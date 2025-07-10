import { Router } from "express";
import {
  registerUser,
  loginUser,
  LogOutUser,
  regenerateRefreshToken,
  RawImageUpload,
} from "../controllers/user.controllers.js";
import { VerifyUser } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-tokens").post(VerifyUser, regenerateRefreshToken);
router
  .route("/raw-image-upload")
  .post(VerifyUser, upload.single("image"), RawImageUpload);

// router.route("/get-user-details/:userId").get(GetUserDetails);

//secured routes
router.route("/logout").post(VerifyUser, LogOutUser);
// router.route("/user/get-user-details/:userId").get(GetUserDetails);

export default router;

import { Router } from "express";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  getUserChannel,
  login,
  logout,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateCoverImage,
  updateUserDetails,
  watchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(login);
router.route("/logout").post(verifyJwt, logout);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/currentUser").get(verifyJwt, getCurrentUser);
router
  .route("/updateAvatar")
  .patch(verifyJwt, upload.single("avatar"), updateAvatar);
router
  .route("/updateCoverImage")
  .patch(verifyJwt, upload.single("coverImage"), updateCoverImage);
router.route("/updateUserDetails").patch(verifyJwt, updateUserDetails);
router.route("/c/:username").get(verifyJwt, getUserChannel);
router.route("/history").get(verifyJwt, watchHistory);
router
  .route("/changeCurrentUserPassword")
  .patch(verifyJwt, changeCurrentUserPassword);

export default router;

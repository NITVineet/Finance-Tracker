import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar
} from "../models/user.model.js";

const router = Router();

// Auth-related routes
router.route("/api/register").post(registerUser);
router.route("/api/login").post(loginUser);
router.route("/api/logout").patch(logoutUser);
router.route("/api/refreshAccessToken").patch(refreshAccessToken);

// User profile and settings routes
router.route("/api/user/current").get(getCurrentUser);
router.route("/api/user/password").patch(changeCurrentPassword);
router.route("/api/user/details").patch(updateUserDetails);
router.route("/api/user/avatar").patch(updateUserAvatar);

export default router;

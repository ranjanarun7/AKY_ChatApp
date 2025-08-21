import express from "express";
import { userLogOut, userLogin, userRegister } from "../RouteController/userRouteController.js";
import upload from "../Middleware/multer.js";

const router = express.Router();

// register route with profilePic upload (Cloudinary)
router.post("/register", upload.single("profilePic"), userRegister);

router.post("/login", userLogin);
router.post("/logout", userLogOut);

export default router;
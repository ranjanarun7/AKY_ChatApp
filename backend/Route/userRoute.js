import express from 'express'
import isLogin from '../Middleware/isLogin.js'
import isUpdateAuth from '../Middleware/isUpdateAuth.js'
import { getCorrentChatters, getUserBySearch } from '../RouteController/userHandlerRouteController.js'
import { updateUser } from "../RouteController/userRouteController.js";
import upload from "../Middleware/multer.js";

const router = express.Router()

router.get('/search', isLogin, getUserBySearch);
router.get('/currentchatters', isLogin, getCorrentChatters);

// 👇 update ke liye naya middleware
router.put('/update', isUpdateAuth, upload.single("profilepic"), updateUser);

export default router
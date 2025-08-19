const express=require("express");
const { sendMessage, getMessages } = require("../RouteController/messageRouteController");
const { isLogin } = require("../Middleware/isLogin");

const router=express.Router();
router.post("/send/:id",isLogin,sendMessage);
router.get("/messages/:id",isLogin,getMessages);
module.exports=router;
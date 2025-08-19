const express=require("express")
const router=express.Router()
const { getUserBySearch, getCurrentChatters } = require('../RouteController/userHandlerRouteController');
const { isLogin } = require("../Middleware/isLogin");

router.get('/search', isLogin, getUserBySearch);
router.get('/currentchatters', isLogin, getCurrentChatters);

module.exports=router
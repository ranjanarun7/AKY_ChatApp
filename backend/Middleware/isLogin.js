const jwt=require("jsonwebtoken");
const User=require("../Models/userModels");
const isLogin=(req,res,next)=>{
 const token=req.cookies.jwt;
 if(!token) return res.status(401).json({error:"Unauthorized"});
 const decoded=jwt.verify(token,process.env.JWT_SECRET);
 if(!decoded) return res.status(403).json({error:"Forbidden"});
 const user=User.findById(decoded.id).select("-password");
 if(!user) return res.status(404).json({error:"User not found"});
 req.user=user;
 next();
};
module.exports={isLogin};

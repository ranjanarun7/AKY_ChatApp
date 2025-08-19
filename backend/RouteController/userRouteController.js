const User=require('../Models/userModels');
const bcrypt = require('bcrypt');
const { createToken } = require('../utils/jwtwebtoken');

const userRegister=async(req,res)=>{
    const {fullname,username,email,gender,password,profilepic}=req.body;
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if(user){
        return res.status(400).json({message:"User already exists"});
    }
    const hashedPassword=await bcrypt.hash(password,10);
    const profileboy=profilepic ||`https://avatar.iran.liara.run/public/boy?username=${username}`;
    const profilegirl=profilepic ||`https://avatar.iran.liara.run/public/girl?username=${username}`;
    if(!fullname || !username || !email || !gender || !password){
        return res.status(400).json({message:"Please fill all fields"});
    }
    try {
        const newUser=new User({
            fullname,
            username,
            email,
            gender,
            password:hashedPassword,
            profilepic:gender === 'male' ? profileboy : profilegirl
        });
        if(newUser) {
            await newUser.save();
            createToken(newUser, res);
            res.status(201).json({
              id: newUser._id,
              fullname: newUser.fullname,
              username: newUser.username,
              email: newUser.email,
              message: "User registered successfully"
            });
        }else {
            res.status(400).json({message:"User registration failed"});
        }
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({message:"Internal server error"});
    }
}

const userLogin=async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.status(400).json({message:"Please fill all fields"});
    }
    try {
        const user=await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Wrong Password"});
        }
        createToken(user, res);
        res.status(201).json({
          id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
          message: "user login successful"
      });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({message:"Internal server error"});
    }
}

const userLogout=async(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({
            success:true,
            message:"User logged out successfully"
        });
    } catch (error) {
        console.error("Register Error:", error);

        res.status(500).json({message:"Internal server error"});
    }
}
module.exports={userRegister,userLogin,userLogout};
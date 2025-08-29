import User from "../Models/userModels.js";
import bcryptjs from 'bcryptjs'
import jwtToken from '../utils/jwtwebtoken.js'

export const userRegister = async (req, res) => {
  try {
    const { fullname, username, email, gender, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(500)
        .send({ success: false, message: "UserName or Email Already Exist" });
    }

    const hashPassword = bcryptjs.hashSync(password, 10);

    // agar user ne pic upload ki hai toh Cloudinary url use karo warna avatar API
    let profilePic;
    if (req.file && req.file.path) {
      profilePic = req.file.path; // ✅ multer-storage-cloudinary automatically url deta hai
    } else {
      profilePic =
        gender === "male"
          ? `https://avatar.iran.liara.run/public/boy?username=${username}`
          : `https://avatar.iran.liara.run/public/girl?username=${username}`;
    }

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashPassword,
      gender,
      profilepic: profilePic,
    });

    await newUser.save();
    jwtToken(newUser._id, res);

    res.status(201).send({
      _id: newUser._id,
      fullname: newUser.fullname,
      username: newUser.username,
      profilepic: newUser.profilepic,
      email: newUser.email,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
    console.log(error);
  }
};


export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) return res.status(500).send({ success: false, message: "Email Dosen't Exist Register" })
        const comparePasss = bcryptjs.compareSync(password, user.password || "");
        if (!comparePasss) return res.status(500).send({ success: false, message: "Email Or Password dosen't Matching" })
        
        jwtToken(user._id, res);

        res.status(200).send({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            profilepic: user.profilepic,
            email:user.email,
            message: "Succesfully LogIn"
        })

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        })
        console.log(error);
    }
}

// update user profile



export const userLogOut=async(req,res)=>{
    
    try {
        res.cookie("jwt",'',{
            maxAge:0
        })
        res.status(200).send({success:true ,message:"User LogOut"})

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        })
        console.log(error);
    }
}

export const updateUser = async (req, res) => {
  try {
    const { fullname, username, email } = req.body;
    let profilePic;

    if (req.file && req.file.path) {
      profilePic = req.file.path; // Cloudinary url
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,   // 👈 ab yaha userId aayega middleware se
      {
        $set: {
          fullname,
          username,
          email,
          ...(profilePic && { profilepic: profilePic }),
        },
      },
      { new: true }
    ).select("-password"); // password return na ho

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

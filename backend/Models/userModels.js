const mongoose=require("mongoose");
const userSchema=mongoose.Schema({
  fullname:{
    type:String,
    required:true
  },
  username:{
    type:String,
    required:true,
    unique:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  gender:{
    type:String,
    enum:["male","female","other"],
    default:"male"
  },
  password:{
    type:String,
    required:true
  },
  profilepic:{
    type:String,
    default:""
  }
},{timestamps:true});
const User=mongoose.model("User",userSchema);
module.exports=User;

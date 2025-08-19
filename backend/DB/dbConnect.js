const mongoose=require('mongoose');
const dbConnect=async()=>{
  try {
    await mongoose.connect(process.env.MONGODB_CONNECT),
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};
module.exports = dbConnect;
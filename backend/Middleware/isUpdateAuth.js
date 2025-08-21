import jwt from "jsonwebtoken";

const isUpdateAuth = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized - No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
    }

    // Sirf userId set kar rahe hai (DB call nahi karenge yaha)
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("Error in isUpdateAuth middleware:", error.message);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export default isUpdateAuth;
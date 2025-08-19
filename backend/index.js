const express = require("express");
const dotenv = require("dotenv");
const authUserRoutes = require("./Route/authUser");
const messageRoutes = require("./Route/messageRoute");
const userRoutes = require("./Route/userRoute");
const dbConnect = require("./DB/dbConnect");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const { app, server } = require("./Socket/socket");
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authUserRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);

// ✅ Native __dirname directly use kar lo
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});


server.listen(PORT, () => {
  dbConnect();
  console.log(`Server is running on port ${PORT}`);
});

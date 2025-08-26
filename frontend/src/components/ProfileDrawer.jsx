import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Pencil } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfileDrawer({ isOpen, onClose, user, setUser }) {
  const { authUser, setAuthUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [editData, setEditData] = useState({
    fullname: user?.fullname || "",
    username: user?.username || "",
    email: user?.email || "",
    profilepic: null,
  });

  const [photoPreview, setPhotoPreview] = useState(false); // 👈 NEW STATE

  useEffect(() => {
    setEditData({
      fullname: user?.fullname || "",
      username: user?.username || "",
      email: user?.email || "",
      profilepic: null,
    });
  }, [user]);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (editData.preview) URL.revokeObjectURL(editData.preview);

    const previewUrl = URL.createObjectURL(file);
    setEditData({ ...editData, profilepic: file, preview: previewUrl });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("fullname", editData.fullname);
      formData.append("username", editData.username);
      formData.append("email", editData.email);
      if (editData.profilepic) formData.append("profilepic", editData.profilepic);

      const { data } = await axios.put("/api/user/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setUser(data.user);
      localStorage.setItem("chatapp", JSON.stringify(data.user));

      onClose();

      if (editData.preview) URL.revokeObjectURL(editData.preview);

      setEditData((prev) => ({ ...prev, preview: null }));
    } catch (error) {
      console.error(error);
      alert("Update failed!");
    }
  };

  const handelLogOut = async () => {
    const confirmlogout = window.prompt("type 'UserName' To LOGOUT");
    if (confirmlogout === authUser.username) {
      setLoading(true);
      try {
        const res = await axios.post("/api/auth/logout");
        toast.info(res.data?.message);
        localStorage.removeItem("chatapp");
        setAuthUser(null);
        navigate("/login");
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else {
      toast.info("LogOut Cancelled");
    }
  };

  return (
    <>
      {/* Background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* Sliding Drawer */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 p-6 flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-sky-600">My Profile</h2>
          <X
            className="cursor-pointer text-sky-600 hover:text-sky-400"
            onClick={onClose}
          />
        </div>

        {/* Profile Pic */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={
              editData.profilepic
                ? URL.createObjectURL(editData.profilepic)
                : user.profilepic
            }
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setPhotoPreview(true)} // 👈 Open Preview
          />
          <label className="cursor-pointer text-blue-500 text-sm mt-2">
            Change Photo
            <input type="file" hidden onChange={handleFileChange} />
          </label>
        </div>

        {/* Username */}
        <div className="mb-3">
          <label className="block text-gray-600 text-sm">Username</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="username"
              value={editData.username}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
            <Pencil size={18} className="text-gray-500" />
          </div>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-gray-600 text-sm">Email</label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
            <Pencil size={18} className="text-gray-500" />
          </div>
        </div>

        {/* Full Name */}
        <div className="mb-3">
          <label className="block text-gray-600 text-sm">Full Name</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="fullname"
              value={editData.fullname}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
            <Pencil size={18} className="text-gray-500" />
          </div>
        </div>

        {/* Save + Logout */}
        <div className="mt-auto space-y-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Save Changes
          </button>

          <button
            onClick={handelLogOut}
            className="bg-red-500 text-white px-4 py-2 rounded w-full"
          >
            Logout
          </button>
        </div>
      </motion.div>

      {/* Fullscreen Photo Preview */}
      {photoPreview && (
        <div
          className="fixed inset-0 bg-transparent flex flex-col items-center justify-center z-[100]"
          onClick={() => setPhotoPreview(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setPhotoPreview(false)}
            className="absolute top-5 right-5 text-white text-2xl"
          >
            ✕
          </button>

          {/* Image */}
          <img
            src={
              editData.profilepic
                ? URL.createObjectURL(editData.profilepic)
                : user.profilepic
            }
            alt="Profile Preview"
            className="max-w-[90%] max-h-[80%] rounded-lg shadow-lg"
          />

          {/* Name */}
          <p className="text-black mt-4 text-lg font-semibold">{user.fullname}</p>
        </div>
      )}
    </>
  );
}

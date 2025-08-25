import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inputData, setInputData] = useState({});
  const [profilePic, setProfilePic] = useState(null);

  const handleInput = (e) => {
    setInputData({
      ...inputData,
      [e.target.id]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (inputData.password !== inputData.confpassword) {
      setLoading(false);
      return toast.error("Passwords don't match");
    }

    try {
      const formData = new FormData();
      Object.keys(inputData).forEach((key) => {
        formData.append(key, inputData[key]);
      });
      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      const register = await axios.post(`/api/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = register.data;
      if (data.success === false) {
        setLoading(false);
        toast.error(data.message);
        return;
      }

      toast.success(data?.message);
      localStorage.setItem("chatapp", JSON.stringify(data));
      setAuthUser(data);
      setLoading(false);
      navigate("/login");
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center mt-6"
    >
      <div className="w-full max-w-md p-6 rounded-xl shadow-lg 
    bg-black/50 backdrop-blur-md border-rounded">
        <h1 className="text-3xl font-bold text-center text-white mb-3 mt-6">
          Register <span className="text-sky-400">AKY-ChatApp</span>
        </h1>

        {/* Profile Image */}
        <div className="relative flex justify-center mb-4">
  <label htmlFor="profilePic" className="cursor-pointer">
    <img
      src={
        profilePic
          ? URL.createObjectURL(profilePic)
          : "https://avatar.iran.liara.run/public/boy?username=guest"
      }
      alt="profile"
      className="w-24 h-24 rounded-full object-cover border-2 border-sky-400"
    />
    {/* Camera Icon Overlay */}
    <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-100 transition-opacity">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7h4l3-3h4l3 3h4v14H3V7z"
        />
        <circle cx="12" cy="13" r="3" stroke="white" strokeWidth={2} />
      </svg>
    </div>
  </label>
  <input
    id="profilePic"
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    className="hidden"
  />
</div>



        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 text-black"
        >
          <input
            id="fullname"
            type="text"
            onChange={handleInput}
            placeholder="Full Name"
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-500 focus:ring-2 focus:ring-sky-400"
          />
          <input
            id="username"
            type="text"
            onChange={handleInput}
            placeholder="Username"
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-500 focus:ring-2 focus:ring-sky-400"
          />
          <input
            id="email"
            type="email"
            onChange={handleInput}
            placeholder="Email"
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-500 focus:ring-2 focus:ring-sky-400"
          />
          <input
            id="password"
            type="password"
            onChange={handleInput}
            placeholder="Password"
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-500 focus:ring-2 focus:ring-sky-400"
          />
          <input
            id="confpassword"
            type="password"
            onChange={handleInput}
            placeholder="Confirm Password"
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-500 focus:ring-2 focus:ring-sky-400"
          />

          {/* Gender */}
          <div className="flex items-center justify-center gap-6 text-sm font-bold">
            <span className="text-gray-950 font-bold">Gender :</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={inputData.gender === "male"}
                onChange={() => setInputData({ ...inputData, gender: "male" })}
                className="accent-sky-400"
              />
              Male
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={inputData.gender === "female"}
                onChange={() =>
                  setInputData({ ...inputData, gender: "female" })
                }
                className="accent-sky-400"
              />
              Female
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-2 text-lg font-semibold text-white bg-gray-950 rounded-lg hover:bg-gray-800 transition-all"
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </form>

        {/* Bottom link */}
        <div className="pt-4 text-center">
          <p className="text-sm text-gray-600">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-gray-950 font-bold underline hover:text-gray-600"
            >
              Login Now!!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

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
      // Use FormData for text + file
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        {/* Profile Image Preview */}
        <div className="flex justify-center mb-4">
          <label htmlFor="profilePic" className="cursor-pointer">
            <img
              src={
                profilePic
                  ? URL.createObjectURL(profilePic)
                  : "https://avatar.iran.liara.run/public/boy?username=guest"
              }
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
            />
          </label>
          <input
            id="profilePic"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register <span className="text-sky-600">AKY-ChatApp</span>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-black">
          <input
            id="fullname"
            type="text"
            onChange={handleInput}
            placeholder="Full Name"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-sky-300"
          />
          <input
            id="username"
            type="text"
            onChange={handleInput}
            placeholder="Username"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-sky-300"
          />
          <input
            id="email"
            type="email"
            onChange={handleInput}
            placeholder="Email"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-sky-300"
          />
          <input
            id="password"
            type="password"
            onChange={handleInput}
            placeholder="Password"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-sky-300"
          />
          <input
            id="confpassword"
            type="password"
            onChange={handleInput}
            placeholder="Confirm Password"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-sky-300"
          />

          {/* Gender Selection */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={inputData.gender === "male"}
                onChange={() => setInputData({ ...inputData, gender: "male" })}
                className="radio radio-info"
              />
              <span className="text-gray-700 font-medium">Male</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={inputData.gender === "female"}
                onChange={() => setInputData({ ...inputData, gender: "female" })}
                className="radio radio-info"
              />
              <span className="text-gray-700 font-medium">Female</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 mt-4 text-lg font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-all"
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-sm text-gray-600">
            Have an account?{" "}
            <Link
              to="/login"
              className="text-sky-700 font-bold underline hover:text-sky-900"
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

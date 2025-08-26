import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { IoArrowBackSharp } from "react-icons/io5";
import userConversation from "../Zustans/useConversation";
import { useSocketContext } from "../context/SocketContext";
import ProfileDrawer from "./ProfileDrawer";
import notify from "../assets/sound/notification.mp3";

const Sidebar = ({ onSelectUser }) => {
  const { authUser, setAuthUser } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [searchUser, setSearchUser] = useState([]);
  const [chatUser, setChatUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setSelectedConversation , selectedConversation } = userConversation();
  const { onlineUser, socket} = useSocketContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState({});

  // fetch chat users
  useEffect(() => {
    const fetchChatUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/user/currentchatters`);
        if (res.data.success === false) console.log(res.data.message);
        else {
          setChatUser(res.data);
          const unreadMap = {};
          res.data.forEach((user) => {
            unreadMap[user._id] = user.unreadCount || 0;
          });
          setNewMessageCount(unreadMap);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChatUsers();
  }, []);

  // search submit
  const handelSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`/api/user/search?search=${searchInput}`);
      if (res.data.success === false) console.log(res.data.message);
      else if (res.data.length === 0) toast.info("User Not Found");
      else setSearchUser(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // live search debounce
  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchUser([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/user/search?search=${searchInput}`);
        if (res.data.success === false) {
          console.log(res.data.message);
        } else if (res.data.length === 0) {
          setSearchUser([]);
        } else {
          setSearchUser(res.data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const handSearchBack = () => {
    setSearchUser([]);
    setSearchInput("");
  };

 // socket handle new messages
useEffect(() => {
  if (!socket) return;

  const handleNewMessage = async (newMessage) => {
    const recId = newMessage.reciverId?.toString?.() || newMessage.reciverId;
    const senId = newMessage.senderId?.toString?.() || newMessage.senderId;

    if (recId === authUser._id.toString()) {
      new Audio(notify).play();

      setChatUser((prev) => {
        const exists = prev.find((u) => u._id === senId);
        if (!exists) {
          // agar senderInfo nahi aaya to API se fetch karo
          if (!newMessage.senderInfo) {
            fetchSenderInfo(senId);
          } else {
            return [
              {
                _id: senId,
                username: newMessage.senderInfo?.username || "Unknown",
                profilepic: newMessage.senderInfo?.profilepic || "",
                unreadCount: 0,
              },
              ...prev,
            ];
          }
        }
        return prev;
      });

      setNewMessageCount((prev) => {
        if (selectedConversation?._id !== senId) {
          return {
            ...prev,
            [senId]: (prev[senId] || 0) + 1,
          };
        }
        return prev;
      });
    }
  };

  socket.on("newMessage", handleNewMessage);
  return () => socket.off("newMessage", handleNewMessage);
}, [socket, authUser._id, selectedConversation?._id]);

// 🔹 helper function to fetch user details
const fetchSenderInfo = async (userId) => {
  try {
    const res = await axios.get(`/api/user/${userId}`);
    if (res.data) {
      setChatUser((prev) => [
        {
          _id: res.data._id,
          username: res.data.username,
          profilepic: res.data.profilepic,
          unreadCount: 0,
        },
        ...prev,
      ]);
    }
  } catch (err) {
    console.log("Failed to fetch sender info:", err);
  }
};


  // reset count when user clicked
  const handelUserClick = async (user) => {
    onSelectUser(user);
    setSelectedConversation(user);

    try {
      await axios.get(`/api/message/${user._id}`);
    } catch (err) {
      console.log(err);
    }

    setNewMessageCount((prev) => {
      const updated = { ...prev };
      delete updated[user._id.toString()];
      return updated;
    });
  };

  return (
    <div className="h-screen w-72 px-2  flex flex-col">
      {/* 🔹 First Row : App Name + Profile */}
      <div className="flex items-center justify-between gap-2 py-2">
        <h1 className="text-2xl font-extrabold text-sky-400 tracking-wide">
          AKY ChatApp
        </h1>
        <img
          onClick={() => setOpenDrawer(true)}
          src={authUser?.profilepic}
          className="h-12 w-12 hover:scale-110 cursor-pointer rounded-full border-2 border-sky-500"
        />
      </div>

      {/* Drawer */}
      {openDrawer && authUser && (
        <ProfileDrawer
          isOpen={openDrawer}
          onClose={() => setOpenDrawer(false)}
          user={authUser}
          setUser={(updatedUser) => {
            setAuthUser(updatedUser);
            localStorage.setItem("chatapp", JSON.stringify(updatedUser));
          }}
        />
      )}

      {/* 🔹 Search */}
      <form
        onSubmit={handelSearchSubmit}
        className="flex items-center justify-between bg-white rounded-full px-2 py-1 mt-2  w-full max-w-md mx-auto"
      >
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          type="text"
          className="px-4 flex-1 bg-transparent outline-none text-black"
          placeholder="Search user..."
        />
        <button className="btn btn-circle bg-sky-700 hover:bg-gray-950 text-white">
          <FaSearch />
        </button>
      </form>

      <div className="divider px-3"></div>

      {/* 🔹 User List (scrollable area) */}
      <div className="flex-1 overflow-y-auto scrollbar">
        {searchUser.length > 0
          ? searchUser.map((user) => (
              <div key={user._id}>
                <div
                  onClick={() => handelUserClick(user)}
                  className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer ${
                    selectedConversation?._id === user._id ? "bg-sky-500" : ""
                  }`}
                >
                  <div
                    className={`avatar ${
                      onlineUser.includes(user._id.toString()) ? "online" : ""
                    }`}
                  >
                    <div className="w-12 rounded-full">
                      <img src={user.profilepic} alt="user.img" />
                    </div>
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="font-bold text-white">{user.username}</p>
                  </div>
                </div>
                <div className="divider divide-solid px-3 h-[1px]"></div>
              </div>
            ))
          : chatUser.length === 0
          ? (
            <div className="font-bold flex flex-col text-xl text-yellow-500 items-center">
              <h1>Why are you Alone!!🤔</h1>
              <h1>Search username to chat</h1>
            </div>
          )
          : chatUser.map((user) => {
              const userIdStr = user._id.toString();
              return (
                <div key={userIdStr}>
                  <div
                    onClick={() => handelUserClick(user)}
                    className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer ${
                      selectedConversation?._id === user._id ? "bg-sky-500" : ""
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={user.profilepic}
                        alt="user.img"
                        className="w-12 h-12 rounded-full"
                      />
                      {onlineUser.includes(user._id.toString()) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <p className="font-bold text-white">{user.username}</p>
                    </div>
                    {newMessageCount[userIdStr] > 0 && (
                      <div className="ml-auto flex items-center justify-center min-w-[20px] h-[20px] rounded-full bg-green-600 text-xs font-bold text-white px-2">
                        + {newMessageCount[userIdStr]}
                      </div>
                    )}
                  </div>
                  <div className="divider divide-solid px-3 h-[1px]"></div>
                </div>
              );
            })}
      </div>

      {/* 🔹 Bottom Back Button (always fixed) */}
      {searchUser.length > 0 && (
        <div className="p-1 border-t border-gray-700 flex justify-center">
          <button
            onClick={handSearchBack}
            className="bg-white text-gray-950 rounded-full px-3 py-2 shadow-md hover:bg-gray-200"
          >
            <IoArrowBackSharp size={25} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

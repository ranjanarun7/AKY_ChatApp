import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { IoArrowBackSharp } from "react-icons/io5";
import userConversation from "../Zustans/useConversation";
import { useSocketContext } from "../context/SocketContext";
import ProfileDrawer from "./ProfileDrawer";

const Sidebar = ({ onSelectUser }) => {
  const { authUser, setAuthUser } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [searchUser, setSearchUser] = useState([]);
  const [chatUser, setChatUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { setSelectedConversation } = userConversation();
  const { onlineUser, socket } = useSocketContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState({});

  // fetch chat users
  useEffect(() => {
    const fetchChatUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/user/currentchatters`);
        if (res.data.success === false) console.log(res.data.message);
        else setChatUser(res.data);
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

  // ✅ socket handle new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const recId = newMessage.reciverId?.toString?.() || newMessage.reciverId;
      const senId = newMessage.senderId?.toString?.() || newMessage.senderId;

      if (recId === authUser._id.toString()) {
        setNewMessageCount((prev) => ({
          ...prev,
          [senId]: (prev[senId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, authUser._id]);

  // ✅ reset count when user clicked
  const handelUserClick = (user) => {
    onSelectUser(user);
    setSelectedConversation(user);
    setSelectedUserId(user._id);

    setNewMessageCount((prev) => {
      const updated = { ...prev };
      delete updated[user._id.toString()];
      return updated;
    });
  };

  return (
    <div className="h-full w-auto px-1">
      {/* Search + Profile */}
      <div className="flex justify-between gap-2">
        <form
          onSubmit={handelSearchSubmit}
          className="w-auto flex items-center justify-between bg-white rounded-full"
        >
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type="text"
            className="px-4 w-auto bg-transparent outline-none rounded-full text-black"
            placeholder="search user"
          />
          <button className="btn btn-circle bg-sky-700 hover:bg-gray-950">
            <FaSearch />
          </button>
        </form>

        <img
          onClick={() => setOpenDrawer(true)}
          src={authUser?.profilepic}
          className="self-center h-12 w-12 hover:scale-110 cursor-pointer rounded-full"
        />

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
      </div>

      <div className="divider px-3"></div>

      {/* User List */}
      {searchUser.length > 0 ? (
        <>
          <div className="min-h-[70%] max-h-[80%] overflow-y-auto scrollbar">
            {searchUser.map((user) => (
              <div key={user._id}>
                <div
                  onClick={() => handelUserClick(user)}
                  className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer ${
                    selectedUserId === user._id ? "bg-sky-500" : ""
                  }`}
                >
                  <div
                    className={`avatar ${
                      onlineUser.includes(user._id) ? "online" : ""
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
            ))}
          </div>
          <div className="mt-auto px-1 py-1 flex">
            <button
              onClick={handSearchBack}
              className="bg-white text-gray-950 rounded-full px-2 py-1 self-center"
            >
              <IoArrowBackSharp size={25} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="min-h-[70%] max-h-[80%] overflow-y-auto scrollbar">
            {chatUser.length === 0 ? (
              <div className="font-bold flex flex-col text-xl text-yellow-500 items-center">
                <h1>Why are you Alone!!🤔</h1>
                <h1>Search username to chat</h1>
              </div>
            ) : (
              chatUser.map((user) => {
                const userIdStr = user._id.toString();
                return (
                  <div key={userIdStr}>
                    <div
                      onClick={() => handelUserClick(user)}
                      className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer ${
                        selectedUserId === user._id ? "bg-sky-500" : ""
                      }`}
                    >
                      <div
                        className={`avatar ${
                          onlineUser.includes(user._id) ? "online" : ""
                        }`}
                      >
                        <div className="w-12 rounded-full">
                          <img src={user.profilepic} alt="user.img" />
                        </div>
                      </div>
                      <div className="flex flex-col flex-1">
                        <p className="font-bold text-white">{user.username}</p>
                      </div>
                      {/* ✅ unread badge */}
                      {newMessageCount[userIdStr] > 0 && (
                        <div className="rounded-full bg-green-700 text-sm text-white px-[6px]">
                          + {newMessageCount[userIdStr]}
                        </div>
                      )}
                    </div>
                    <div className="divider divide-solid px-3 h-[1px]"></div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
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
  const { setSelectedConversation, selectedConversation } = userConversation();
  const { onlineUser, socket } = useSocketContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState({});
  const [searchCompleted, setSearchCompleted] = useState(false);

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

  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchUser([]);
      setSearchCompleted(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setSearchCompleted(false);
      try {
        const res = await axios.get(`/api/user/search?search=${searchInput}`);
        if (res.data.success === false) {
          console.log(res.data.message);
          setSearchUser([]);
        } else {
          setSearchUser(res.data);
        }
      } catch (err) {
        console.log(err);
        setSearchUser([]);
      } finally {
        setLoading(false);
        setSearchCompleted(true);
      }
    }, 100);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const clearSearch = () => {
    setSearchInput("");
    setSearchUser([]);
  };

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
    <div className="h-screen w-full sm:w-72 px-2  flex flex-col">
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
      <div className="flex items-center justify-between bg-white rounded-full px-2 py-1 mt-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          type="text"
          className="px-4 flex-1 bg-transparent outline-none text-black py-2"
          placeholder="Search user..."
        />
        {searchInput && (
          <button
            onClick={clearSearch}
            className="text-gray-700 hover:text-black mr-2 font-bold text-2xl"
          >
            ×
          </button>
        )}
      </div>

      <div className="divider px-3"></div>

      <div className="flex-1 overflow-y-auto scrollbar">
        {searchInput ? (
          loading ? (
            <p className="text-gray-400 text-center mt-4 font-bold">
              Searching...
            </p>
          ) : searchUser.length > 0 ? (
            searchUser.map((user) => (
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
          ) : (
            searchCompleted && (
              <p className="text-gray-400 text-center mt-4 font-bold">
                User not found 🚫
              </p>
            )
          )
        ) : chatUser.length === 0 ? (
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
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;

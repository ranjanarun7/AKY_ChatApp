import React, { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import axios from 'axios';
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { IoArrowBackSharp } from 'react-icons/io5';
import { BiLogOut } from "react-icons/bi";
import userConversation from '../Zustans/useConversation';
import { useSocketContext } from '../context/SocketContext';

const Sidebar = ({ onSelectUser }) => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();

  const [searchInput, setSearchInput] = useState('');
  const [searchUser, setSearchuser] = useState([]);  // ✅ always array
  const [chatUser, setChatUser] = useState([]);      // ✅ always array
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageUsers, setNewMessageUsers] = useState(null); // ✅ default null

  const { setSelectedConversation } = userConversation();
  const { onlineUser, socket } = useSocketContext();

  // ✅ handle socket new message
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      setNewMessageUsers(newMessage);
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket]);

  // ✅ fetch chat users
  useEffect(() => {
    const chatUserHandler = async () => {
      setLoading(true)
      try {
        const chatters = await axios.get(`/api/user/currentchatters`)
        const data = chatters.data;
        if (data.success === false) {
          console.log(data.message);
        } else {
          setChatUser(Array.isArray(data) ? data : []); // ✅ safe array
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.log(error);
      }
    }
    chatUserHandler()
  }, [])

  // ✅ search submit
  const handelSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      const search = await axios.get(`/api/user/search?search=${searchInput}`);
      const data = search.data;
      if (data.success === false) {
        console.log(data.message);
      }
      if (!Array.isArray(data) || data.length === 0) {
        toast.info("User Not Found")
        setSearchuser([]);
      } else {
        setSearchuser(data);
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error);
    }
  }

  // ✅ user select
  const handelUserClick = (user) => {
    onSelectUser(user);
    setSelectedConversation(user);
    setSelectedUserId(user._id);
    setNewMessageUsers(null); // reset notification
  }

  const handSearchback = () => {
    setSearchuser([]);
    setSearchInput('')
  }

  const handelLogOut = async () => {
    const confirmlogout = window.prompt("type 'UserName' To LOGOUT");
    if (confirmlogout === authUser.username) {
      setLoading(true)
      try {
        const logout = await axios.post('/api/auth/logout')
        const data = logout.data;
        if (data?.success === false) {
          console.log(data?.message);
        }
        toast.info(data?.message)
        localStorage.removeItem('chatapp')
        setAuthUser(null)
        setLoading(false)
        navigate('/login')
      } catch (error) {
        setLoading(false)
        console.log(error);
      }
    } else {
      toast.info("LogOut Cancelled")
    }
  }

  return (
    <div className='h-full w-auto px-1'>
      <div className='flex justify-between gap-2'>
        <form onSubmit={handelSearchSubmit} className='w-auto flex items-center justify-between bg-white rounded-full '>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type='text'
            className='px-4 w-auto bg-transparent outline-none rounded-full'
            placeholder='search user'
          />
          <button className='btn btn-circle bg-sky-700 hover:bg-gray-950'>
            <FaSearch />
          </button>
        </form>
        <img
          onClick={() => navigate(`/profile/${authUser?._id}`)}
          src={authUser?.profilepic}
          className='self-center h-12 w-12 hover:scale-110 cursor-pointer'
        />
      </div>
      <div className='divider px-3'></div>

      {searchUser?.length > 0 ? (
        <>
          <div className="min-h-[70%] max-h-[80%] overflow-y-auto scrollbar">
            {Array.isArray(searchUser) && searchUser.map((user) => (
              <div key={user._id}>
                <div
                  onClick={() => handelUserClick(user)}
                  className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer 
                  ${selectedUserId === user?._id ? 'bg-sky-500' : ''}`}>

                  {/* ✅ Online check */}
                  <div className={`avatar ${onlineUser.includes(user._id) ? 'online' : ''}`}>
                    <div className="w-12 rounded-full">
                      <img src={user.profilepic} alt='user.img' />
                    </div>
                  </div>
                  <div className='flex flex-col flex-1'>
                    <p className='font-bold text-gray-950'>{user.username}</p>
                  </div>
                </div>
                <div className='divider divide-solid px-3 h-[1px]'></div>
              </div>
            ))}
          </div>
          <div className='mt-auto px-1 py-1 flex'>
            <button onClick={handSearchback} className='bg-white text-gray-950 rounded-full px-2 py-1 self-center'>
              <IoArrowBackSharp size={25} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="min-h-[70%] max-h-[80%] overflow-y-auto scrollbar">
            {chatUser.length === 0 ? (
              <div className='font-bold items-center flex flex-col text-xl text-yellow-500'>
                <h1>Why are you Alone!!🤔</h1>
                <h1>Search username to chat</h1>
              </div>
            ) : (
              <>
                {Array.isArray(chatUser) && chatUser.map((user) => (
                  <div key={user._id}>
                    <div
                      onClick={() => handelUserClick(user)}
                      className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer 
                      ${selectedUserId === user?._id ? 'bg-sky-500' : ''}`}>

                      {/* ✅ Online check */}
                      <div className={`avatar ${onlineUser.includes(user._id) ? 'online' : ''}`}>
                        <div className="w-12 rounded-full">
                          <img src={user.profilepic} alt='user.img' />
                        </div>
                      </div>
                      <div className='flex flex-col flex-1'>
                        <p className='font-bold text-gray-950'>{user.username}</p>
                      </div>

                      {/* ✅ Safe notification check */}
                      <div>
                        {newMessageUsers &&
                          newMessageUsers.reciverId === authUser._id &&
                          newMessageUsers.senderId === user._id && (
                            <div className="rounded-full bg-green-700 text-sm text-white px-[4px]">+1</div>
                        )}
                      </div>
                    </div>
                    <div className='divider divide-solid px-3 h-[1px]'></div>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className='mt-auto px-1 py-1 flex'>
            <button onClick={handelLogOut} className='hover:bg-red-600  w-10 cursor-pointer hover:text-white rounded-lg'>
              <BiLogOut size={25} />
            </button>
            <p className='text-sm py-1'>Logout</p>
          </div>
        </>
      )}
    </div>
  )
}

export default Sidebar;
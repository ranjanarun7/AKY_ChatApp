import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const { authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      // ✅ dev/prod URL fix
      const socketInstance = io(
        import.meta.env.MODE === "development"
          ? "http://localhost:5000" // ⚡️ yahan aapke backend ka local port dena
          : "https://aky-chatapp.onrender.com",
        {
          query: {
            userId: authUser._id.toString(),
          },
        }
      );

      // ✅ online users listener
      socketInstance.on("getOnlineUsers", (users) => {
        setOnlineUser(users);
      });

      setSocket(socketInstance);

      // ✅ cleanup properly
      return () => {
        socketInstance.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUser }}>
      {children}
    </SocketContext.Provider>
  );
};

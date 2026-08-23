import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Dynamically target backend port 5000 for local Wi-Fi devices / mobile phones
    const hostname = window.location.hostname;
    const socketURL = `http://${hostname}:5000`;

    const newSocket = io(socketURL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Connected to Socket.io WebSockets Server with ID:', newSocket.id);
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

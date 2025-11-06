// contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext'; // Importa tu AuthContext

const API_URL = "http://localhost:3001"; // La URL de tu backend

// 1. Definir el tipo para el contexto
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

// 2. Crear el Contexto
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// 3. Crear el Proveedor (Provider)
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth(); // Obtiene el usuario logueado
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Si hay un usuario, crea la conexión del socket
      const newSocket = io(API_URL);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        // Envía el evento 'join' al backend con el ID del usuario
        newSocket.emit('join', String(currentUser.id));
        console.log('Socket conectado y unido:', currentUser.id);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket desconectado');
      });

      // Limpieza: desconecta el socket cuando el componente se desmonta o el usuario cambia
      return () => {
        newSocket.disconnect();
      };
    } else {
      // Si no hay usuario (logout), desconecta cualquier socket existente
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
    }
  }, [currentUser]); // Se ejecuta de nuevo si el usuario cambia (login/logout)

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// 4. Crear el Hook personalizado
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket debe ser usado dentro de un SocketProvider');
  }
  return context;
};
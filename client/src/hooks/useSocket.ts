import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const useSocket = () => {
    const [socket] = useState<Socket>(() => io(SOCKET_URL));

    useEffect(() => {
        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return socket;
};

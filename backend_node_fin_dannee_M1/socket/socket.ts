import dotenv from "dotenv";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { registerUserEvents } from "./userEvents";
import User from "../modals/User";

dotenv.config();

export function initializeSocket(server: any): SocketIOServer {
    const io = new SocketIOServer(server, {
        cors: {
            origin: "*"
        }
    });

    // Auth middleware
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentification error: no token provided"));
        }

        jwt.verify(token, process.env.JWT_SECRET as string, (error: any, decoded: any) => {
            if (error) {
                return next(new Error("Authentification error: invalid token"));
            }

            // Attach user data to socket
            let userData = decoded.user;
            socket.data = userData;
            socket.data.userId = userData.id;
            next();
        });
    });

    // When socket connects, register events
    io.on("connection", async (socket: Socket) => {
        const userId = socket.data.userId;
        console.log(`✅ User connected ${userId}, username: ${socket.data.name}`);

        // Join user's personal room for notifications
        socket.join(userId);

        // Mettre à jour le statut en ligne
        try {
            await User.findByIdAndUpdate(userId, {
                isOnline: true,
                lastSeen: new Date()
            });

            // Notifier tous les autres utilisateurs du changement de statut
            socket.broadcast.emit("userStatusChanged", {
                userId,
                isOnline: true,
                lastSeen: new Date()
            });
        } catch (error) {
            console.log("❌ Error updating online status:", error);
        }

        // Register events
        registerUserEvents(io, socket);

       

        socket.on("disconnect", async () => {
            console.log(`❌ User disconnected ${userId}, username: ${socket.data.name}`);
            
            // Mettre à jour le statut hors ligne
            try {
                await User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    lastSeen: new Date()
                });

                // Notifier tous les autres utilisateurs
                socket.broadcast.emit("userStatusChanged", {
                    userId,
                    isOnline: false,
                    lastSeen: new Date()
                });
            } catch (error) {
                console.log("❌ Error updating offline status:", error);
            }
        });
    });

    return io;
}
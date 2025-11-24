// src/socket/socket.ts
import dotenv from "dotenv";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { registerUserEvents } from "./userEvents";
import { registerCommandeEvents } from "./commandeEvent";
import User from "../modals/User";
import Commande from "../modals/Commande";

dotenv.config();

export function initializeSocket(server: any): SocketIOServer {
    const io = new SocketIOServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        // ✅ Configuration pour améliorer la stabilité
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling']
    });

    console.log("🚀 Socket.IO server initialized");

    // Auth middleware
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            console.log("❌ Connection attempt without token");
            return next(new Error("Authentification error: no token provided"));
        }

        jwt.verify(token, process.env.JWT_SECRET as string, (error: any, decoded: any) => {
            if (error) {
                console.log("❌ Invalid token:", error.message);
                return next(new Error("Authentification error: invalid token"));
            }

            // Attach user data to socket
            let userData = decoded.user;
            socket.data = userData;
            socket.data.userId = userData.id;
            console.log(`✅ Token verified for user: ${userData.name} (${userData.id})`);
            next();
        });
    });

    // When socket connects, register events
    io.on("connection", async (socket: Socket) => {
        const userId = socket.data.userId;
        const userName = socket.data.name;
        console.log(`\n🔌 ============================================`);
        console.log(`✅ User connected: ${userName} (${userId})`);
        console.log(`📡 Socket ID: ${socket.id}`);
        console.log(`🔌 ============================================\n`);

        // Join user's personal room for notifications
        socket.join(userId);
        console.log(`📍 User ${userName} joined room: ${userId}`);

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

            console.log(`✅ User ${userName} status updated to online`);

            // ✅ CRITIQUE: Envoyer le compteur de commandes non lues dès la connexion
            const unreadCount = await Commande.countDocuments({ isRead: false });
            
            // Envoyer au client spécifique
            socket.emit("unreadCommandesCount", { count: unreadCount });
            console.log(`📊 Initial unread count sent to ${userName}: ${unreadCount} commandes non lues`);
            
            // ✅ IMPORTANT: Envoyer aussi à tous les autres clients pour synchronisation
            socket.broadcast.emit("unreadCommandesCount", { count: unreadCount });
            console.log(`📊 Broadcast unread count to all other clients: ${unreadCount}`);

        } catch (error) {
            console.error(`❌ Error updating online status for ${userName}:`, error);
        }

        // Register all events
        console.log(`📦 Registering events for user ${userName}...`);
        registerUserEvents(io, socket);
        registerCommandeEvents(io, socket);
        console.log(`✅ Events registered successfully for ${userName}`);

        // ✅ NOUVEAU: Log toutes les émissions d'événements
        const originalEmit = socket.emit.bind(socket);
        socket.emit = function(event: string, ...args: any[]) {
            if (event !== "ping" && event !== "pong") {
                console.log(`📤 [${socket.id}] Emitting event: ${event}`, args.length > 0 ? args[0] : '');
            }
            return originalEmit(event, ...args);
        };

        // ✅ NOUVEAU: Log toutes les broadcast
        const originalBroadcast = socket.broadcast.emit.bind(socket.broadcast);
        socket.broadcast.emit = function(event: string, ...args: any[]) {
            if (event !== "ping" && event !== "pong") {
                console.log(`📡 [BROADCAST from ${socket.id}] Event: ${event}`, args.length > 0 ? args[0] : '');
            }
            return originalBroadcast(event, ...args);
        };

        socket.on("disconnect", async (reason) => {
            console.log(`\n❌ ============================================`);
            console.log(`❌ User disconnected: ${userName} (${userId})`);
            console.log(`📡 Socket ID: ${socket.id}`);
            console.log(`📝 Reason: ${reason}`);
            console.log(`❌ ============================================\n`);
            
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

                console.log(`✅ User ${userName} status updated to offline`);
            } catch (error) {
                console.error(`❌ Error updating offline status for ${userName}:`, error);
            }
        });

        // ✅ NOUVEAU: Log des erreurs socket
        socket.on("error", (error) => {
            console.error(`❌ Socket error for ${userName}:`, error);
        });
    });

    // ✅ NOUVEAU: Log des événements io globaux
    io.on("error", (error) => {
        console.error("❌ Socket.IO server error:", error);
    });

    console.log("✅ Socket.IO server ready to accept connections");

    return io;
}
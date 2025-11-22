import { Server as SocketIOServer, Socket } from "socket.io";
import User from "../modals/User";
import { generatedToken } from "../utils/token";

export function registerUserEvents(io: SocketIOServer, socket: Socket) {
    
    socket.on("testSocket", (data) => {
        socket.emit("testSocket", { msg: "realtime updates!" });
    });

    socket.on("updateProfile", async (data: { name?: string; avatar?: string }) => {
        console.log("updateProfile event: ", data);

        const userId = socket.data.userId;
        if (!userId) {
            return socket.emit("updateProfile", {
                success: false,
                msg: "Unauthorized",
            });
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { name: data.name, avatar: data.avatar },
                { new: true }
            );

            if (!updatedUser) {
                return socket.emit("updateProfile", {
                    success: false,
                    msg: "User not found",
                });
            }

            const newToken = generatedToken(updatedUser);

            socket.emit("updateProfile", {
                success: true,
                data: { token: newToken },
                msg: "Profile updated successfully",
            });
        } catch (error) {
            console.log("Error updating profile: ", error);
            socket.emit("updateProfile", {
                success: false,
                msg: "Error updating profile",
            });
        }
    });
  

    // Nouveau événement pour obtenir le statut d'un utilisateur spécifique
    socket.on("getUserStatus", async (data: { userId: string }) => {
        try {
            const user = await User.findById(data.userId, {
                isOnline: 1,
                lastSeen: 1
            }).lean();

            if (!user) {
                return socket.emit("getUserStatus", {
                    success: false,
                    msg: "User not found"
                });
            }

            socket.emit("getUserStatus", {
                success: true,
                data: {
                    userId: data.userId,
                    isOnline: user.isOnline || false,
                    lastSeen: user.lastSeen || new Date()
                }
            });
        } catch (error) {
            console.log("getUserStatus error: ", error);
            socket.emit("getUserStatus", {
                success: false,
                msg: "Failed to fetch user status"
            });
        }
    });
}
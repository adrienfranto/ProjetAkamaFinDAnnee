"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userEvents_1 = require("./userEvents");
const chatEvents_1 = require("./chatEvents");
const Conversation_1 = __importDefault(require("../modals/Conversation"));
dotenv_1.default.config();
function initializeSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*"
        }
    });
    // auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentification error : no token provided"));
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (error, decoded) => {
            if (error) {
                return next(new Error("Authentification error : invalide token"));
            }
            // attach user data to socket
            let userData = decoded.user;
            socket.data = userData;
            socket.data.userId = userData.id;
            next();
        });
    });
    // when socket connects , register events
    io.on("connection", async (socket) => {
        const userId = socket.data.userId;
        console.log(`user connected ${userId} , username: ${socket.data.name}`);
        //register events
        (0, chatEvents_1.registerChatEvents)(io, socket);
        (0, userEvents_1.registerUserEvents)(io, socket);
        // join all the conversations the user is part of
        try {
            const conversations = await Conversation_1.default.find({
                participants: userId
            }).select("_id");
            conversations.forEach(conversation => {
                socket.join(conversation._id.toString());
            });
        }
        catch (error) {
            console.log("Error joining conversation:", error);
        }
        socket.on("disconnect", () => {
            // user logs out
            console.log(`user disconnected ${userId} , username: ${socket.data.name}`);
        });
    });
    return io;
}
//# sourceMappingURL=socket.js.map
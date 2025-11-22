"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatEvents = registerChatEvents;
require("../modals/Message");
const Conversation_1 = __importDefault(require("../modals/Conversation"));
const Message_1 = __importDefault(require("../modals/Message"));
function registerChatEvents(io, socket) {
    socket.on("getConversations", async () => {
        try {
            const userId = socket.data.userId;
            if (!userId) {
                socket.emit("getConversations", { success: false, msg: "Unauthorized" });
                return;
            }
            const conversations = await Conversation_1.default.find({ participants: userId })
                .sort({ updatedAt: -1 })
                .populate({
                path: "lastMessage",
                select: "content senderId attachement createdAt",
            })
                .populate({
                path: "participants",
                select: "name avatar email",
            })
                .populate({
                path: "createdBy",
                select: "name avatar email",
            })
                .lean();
            socket.emit("getConversations", { success: true, data: conversations });
        }
        catch (error) {
            console.error("❌ getConversations error:", error.message);
            socket.emit("getConversations", { success: false, msg: error.message || "Failed to fetch conversations" });
        }
    });
    // Create a new conversation
    socket.on("newConversation", async (data) => {
        try {
            const userId = socket.data.userId;
            if (!userId)
                throw new Error("Unauthorized user");
            if (data.type === "direct") {
                const existingConversation = await Conversation_1.default.findOne({
                    type: "direct",
                    participants: { $all: data.participants, $size: 2 }
                })
                    .populate("participants", "name avatar email")
                    .populate("createdBy", "name avatar email")
                    .lean();
                if (existingConversation) {
                    socket.emit("newConversation", { success: true, data: { ...existingConversation, isNew: false } });
                    return;
                }
            }
            const conversation = await Conversation_1.default.create({
                type: data.type,
                participants: data.participants,
                name: data.name || "",
                avatar: data.avatar || "",
                createdBy: data.createdBy || userId
            });
            const populatedConversation = await Conversation_1.default.findById(conversation._id)
                .populate("participants", "name avatar email")
                .populate("createdBy", "name avatar email")
                .lean();
            const participantSockets = Array.from(io.sockets.sockets.values())
                .filter(s => data.participants.includes(s.data.userId));
            participantSockets.forEach(s => s.join(conversation._id.toString()));
            io.to(conversation._id.toString()).emit("newConversation", {
                success: true,
                data: { ...populatedConversation, isNew: true }
            });
        }
        catch (error) {
            console.error("❌ newConversation error:", error.message);
            socket.emit("newConversation", { success: false, msg: "Failed to create conversation" });
        }
    });
    socket.on("newMessage", async (data) => {
        console.log("newMessage event : ", data);
        try {
            const message = await Message_1.default.create({
                conversationId: data.conversationId,
                senderId: data.sender.id,
                content: data.content,
                attachement: data.attachement
            });
            io.to(data.conversationId).emit("newMessage", {
                success: true,
                data: {
                    id: message._id,
                    content: data.content,
                    sender: {
                        id: data.sender.id,
                        name: data.sender.name,
                        avatar: data.sender.avatar,
                    },
                    attachement: data.attachement,
                    createdAt: new Date().toISOString(),
                    conversationId: data.conversationId,
                }
            });
            // update conversation's last message
            await Conversation_1.default.findByIdAndUpdate(data.conversationId, {
                lastMessage: message._id
            });
        }
        catch (error) {
            socket.emit("newMessage", {
                success: false,
                msg: "Failed to send message"
            });
        }
    });
    socket.on("getMessages", async (data) => {
        console.log("getMessages event :", data);
        try {
            const messages = await Message_1.default.find({
                conversationId: data.conversationId
            })
                .sort({ createdAt: -1 })
                .populate({
                path: "senderId",
                select: "name avatar"
            })
                .lean();
            const messageWithSender = messages.map((message) => ({
                ...message,
                id: message._id,
                sender: {
                    id: message.senderId?._id,
                    name: message.senderId?.name,
                    avatar: message.senderId?.avatar
                }
            }));
            socket.emit("getMessages", {
                success: true,
                data: messageWithSender
            });
        }
        catch (error) {
            console.log("getMessages error:", error);
            socket.emit("getMessages", {
                success: false,
                msg: "Failed to fetch messages"
            });
        }
    });
}
//# sourceMappingURL=chatEvents.js.map
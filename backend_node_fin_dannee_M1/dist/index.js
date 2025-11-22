"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const socket_1 = require("./socket/socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Routes
app.use("/api/auth", auth_routes_1.default);
app.get("/", (req, res) => res.send("Server is running"));
const PORT = process.env.PORT || 3000;
const server = http_1.default.createServer(app);
// listen to socket events
(0, socket_1.initializeSocket)(server);
(0, db_1.default)()
    .then(() => {
    console.log("✅ Database connected");
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
    .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map
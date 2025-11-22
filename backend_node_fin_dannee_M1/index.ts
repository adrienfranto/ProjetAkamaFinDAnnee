import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import commandeRoutes from "./routes/commande.routes";
import menuItemRoutes from "./routes/menuItem.routes";
import platRoutes from "./routes/plat.routes";
import publicationRoutes from "./routes/publication.routes";
import { initializeSocket } from "./socket/socket";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // En production, spécifiez les domaines autorisés
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/commandes", commandeRoutes);
app.use("/api/menu", menuItemRoutes);
app.use("/api/plats", platRoutes);
app.use("/api/publications", publicationRoutes);

// Health check
app.get("/", (req, res) => res.send("🚀 Server is running"));
app.get("/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Connect to database and start server
connectDB()
  .then(() => {
    console.log("✅ Database connected");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO initialized`);
      console.log(`📍 API routes available:`);
      console.log(`   - POST   /api/auth/register`);
      console.log(`   - POST   /api/auth/login`);
      console.log(`   - GET    /api/commandes`);
      console.log(`   - POST   /api/commandes`);
      console.log(`   - GET    /api/commandes/:id`);
      console.log(`   - PUT    /api/commandes/:id`);
      console.log(`   - DELETE /api/commandes/:id`);
      console.log(`   - GET    /api/menu`);
      console.log(`   - POST   /api/menu`);
      console.log(`   - PUT    /api/menu/:id`);
      console.log(`   - DELETE /api/menu/:id`);
      console.log(`   - GET    /api/plats`);
      console.log(`   - POST   /api/plats`);
      console.log(`   - GET    /api/plats/:id`);
      console.log(`   - PUT    /api/plats/:id`);
      console.log(`   - DELETE /api/plats/:id`);
      console.log(`   - GET    /api/publications`);
      console.log(`   - POST   /api/publications`);
      console.log(`   - DELETE /api/publications/:id`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });
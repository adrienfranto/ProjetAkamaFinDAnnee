import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  password: string;
  email: string;
  avatar?: string;
  role: "admin" | "client"; // Nouveau champ
  isOnline?: boolean;
  lastSeen?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, maxlength: 60 },
    password: { type: String, required: true, maxlength: 200 },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    role: { 
      type: String, 
      enum: ["admin", "client"], 
      default: "client",
      required: true 
    },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export default model<IUser>("User", UserSchema);
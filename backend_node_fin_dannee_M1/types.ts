// src/types/index.ts
import { Document, Types } from "mongoose";

export interface UserProps extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  role: "admin" | "client"; // Nouveau champ
  isOnline?: boolean;
  lastSeen?: Date;
  createdAt: Date;
}

export interface CommandeProps extends Document {
  _id: Types.ObjectId;
  tableNumber: number;
  orderNumber: string;
  totalAmount: string;
  paymentMethod: string;
  status: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemProps extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatProps extends Document {
  _id: Types.ObjectId;
  nom: string;
  description: string;
  prix: number;
  prixPromo?: number;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicationProps extends Document {
  _id: Types.ObjectId;
  nom?: string | null;
  description: string;
  prix?: number | null;
  prixPromo?: number | null;
  image?: string | null;
  createdAt: Date;
}

export interface ResponseProps {
  success: boolean;
  data?: any;
  msg?: string;
}
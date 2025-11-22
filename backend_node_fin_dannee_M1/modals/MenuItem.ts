import { Schema, model, Document, Types } from "mongoose";

export interface MenuItemProps extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<MenuItemProps>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default model<MenuItemProps>("MenuItem", MenuItemSchema);
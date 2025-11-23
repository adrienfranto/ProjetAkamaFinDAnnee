import { Schema, model, Document, Types } from "mongoose";

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

const CommandeSchema = new Schema<CommandeProps>(
  {
    tableNumber: {
      type: Number,
      required: true,
      default: 0,
    },
    orderNumber: {
      type: String,
      required: true,
      default: "Commande",
    },
    totalAmount: {
      type: String,
      required: true,
      default: "0",
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "Inconnu",
    },
    status: {
      type: String,
      required: true,
      default: "En cours",
      enum: ["En cours", "Terminée", "Annulée", "En préparation", "Livrée", "Payée"],
    },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model<CommandeProps>("Commande", CommandeSchema);
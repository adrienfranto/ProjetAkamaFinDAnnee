import { Schema, model, Document, Types } from "mongoose";

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

const PlatSchema = new Schema<PlatProps>(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    prix: {
      type: Number,
      required: true,
      min: 0,
    },
    prixPromo: {
      type: Number,
      default: null,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<PlatProps>("Plat", PlatSchema);
// src/modals/Publication.ts
import { Schema, model, Document, Types } from "mongoose";

export interface PublicationProps extends Document {
  _id: Types.ObjectId;
  nom?: string | null;
  description: string;
  prix?: number | null;
  prixPromo?: number | null;
  image?: string | null;
  createdAt: Date;
}

const PublicationSchema = new Schema<PublicationProps>(
  {
    nom: {
      type: String,
      maxlength: 120,
      default: null,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    prix: {
      type: Number,
      default: null,
      min: 0,
    },
    prixPromo: {
      type: Number,
      default: null,
      min: 0,
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

// Index pour optimiser les recherches
PublicationSchema.index({ createdAt: -1 });

export default model<PublicationProps>("Publication", PublicationSchema);
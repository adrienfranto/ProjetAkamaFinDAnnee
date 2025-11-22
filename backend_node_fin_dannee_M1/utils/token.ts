import { UserProps } from "../types";
import jwt from "jsonwebtoken"

export const generatedToken = (user: UserProps) => {
    const payload = {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }
    }

    return jwt.sign(payload, process.env.JWT_SECRET as string || "adrienfranto", {
        expiresIn: "30d"
    }); 
}
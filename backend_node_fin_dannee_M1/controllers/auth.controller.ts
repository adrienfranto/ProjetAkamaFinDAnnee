import User from "../modals/User";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generatedToken } from "../utils/token";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, avatar } = req.body;
  try {
    // Validation des champs requis
    if (!email || !password || !name) {
      res.status(400).json({ 
        success: false, 
        msg: "Email, password et name sont requis" 
      });
      return;
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ success: false, msg: "User already exists" });
      return;
    }

    // Create new user
    user = new User({
      email,
      password,
      name,
      avatar: avatar || "",
      isOnline: false,
      lastSeen: new Date(),
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Generate token
    const token = generatedToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    // Validation
    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        msg: "Email et password sont requis" 
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, msg: "Invalid credentials" });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, msg: "Invalid credentials" });
      return;
    }

    // Generate token
    const token = generatedToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
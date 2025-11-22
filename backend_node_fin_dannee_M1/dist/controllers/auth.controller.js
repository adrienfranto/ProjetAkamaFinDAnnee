"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../modals/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_1 = require("../utils/token");
const registerUser = async (req, res) => {
    const { email, password, name, avatar } = req.body;
    try {
        //check if already exists
        let user = await User_1.default.findOne({ email });
        if (user) {
            res.status(400).json({ succes: false, msg: "User alert exists" });
            return;
        }
        //create new user
        user = new User_1.default({
            email,
            password,
            name,
            avatar: avatar || ""
        });
        // hash the password
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        //save user
        await user.save();
        // gen token
        const token = (0, token_1.generatedToken)(user);
        res.json({
            success: true,
            token
        });
    }
    catch (error) {
        console.log("error : ", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        //find user by email
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ success: false, msg: "Invalid credentils" });
            return;
        }
        // compare passwords;
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ succes: false, msg: "Invalid crendentiels" });
            return;
        }
        // gen token
        const token = (0, token_1.generatedToken)(user);
        res.json({
            success: true,
            token
        });
    }
    catch (error) {
        console.log("error : ", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=auth.controller.js.map
import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from 'bcrypt';
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Controller for User Registration
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields (Name, Email, Password) are required' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Find user by email
        const user = await User.findOne({ email: cleanEmail });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword
        });
        await newUser.save();

        // Setting user data in session
        req.session.isLoggedIn = true;
        req.session.userId = (newUser._id as any).toString();

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
            }
            return res.json({
                message: 'Account created successfully',
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                }
            });
        });

    } catch (error: any) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: error.message || "Registration failed" });
    }
}


// Controller for User Login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Find user by email
        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Setting user data in session
        req.session.isLoggedIn = true;
        req.session.userId = (user._id as any).toString();

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
            }
            return res.json({
                message: 'Login successful',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                }
            });
        });

    } catch (error: any) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message || "Login failed" });
    }
}


// Controller for User Logout
export const logoutUser = (req: Request, res: Response) => {
    req.session.destroy((error: any) => {
        if (error) {
            console.error("Logout Error:", error);
            return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid', { path: '/' });
        return res.json({ message: 'Logged out successfully' });
    });
}


// Controller for user verify
export const verifyUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;

        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });

    } catch (error: any) {
        console.error("Verify Error:", error);
        res.status(500).json({ message: error.message || "Verification failed" });
    }
}


// Controller for Google OAuth Login
export const googleLoginUser = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Google ID token is required" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: "Invalid Google token payload" });
        }

        const cleanEmail = payload.email.trim().toLowerCase();
        const userName = payload.name || cleanEmail.split("@")[0];

        let user = await User.findOne({ email: cleanEmail });

        if (!user) {
            // Generate random password for user created via Google OAuth
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new User({
                name: userName,
                email: cleanEmail,
                password: hashedPassword,
            });
            await user.save();
        }

        req.session.isLoggedIn = true;
        req.session.userId = (user._id as any).toString();

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
            }
            return res.json({
                message: "Signed in with Google successfully",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                }
            });
        });

    } catch (error: any) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: error.message || "Google authentication failed" });
    }
};
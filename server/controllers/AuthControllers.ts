import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from 'bcrypt';


// Controller for User Registration


export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        //Find user by email
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        //Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();

        //Setting user data in session
        req.session.isLoggedIn = true;
        req.session.userId = newUser._id;


        return res.json({
            message : 'Account created successfully',
            user : {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }
        })


        
    } catch (error : any) {
        console.error(error);
        res.status(500).json({ message: error.message });  
    }
}


//Controller for User Login


export const loginUser = async (req: Request, res: Response) => {
    try{

       
        const {email, password } = req.body;

        //Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }






        //Setting user data in session
        req.session.isLoggedIn = true;
        req.session.userId = user._id;


        return res.json({
            message : 'Login successfully',
            user : {
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        })


    }catch (error : any) {
         console.error(error);
        res.status(500).json({ message: error.message });  
    }
}



//Controller for User Logout

export const logoutUser = (req: Request, res: Response) => {
    req.session.destroy((error : any) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: error.message });
        }
    });
    res.json({ message: 'Logged out successfully' });

}


//Controller for user verify
export const verifyUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;

        const user = await User.findById(userId).select('-password');
        //Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'Invalid user' });
        }
        res.json({ user });

        
    } catch (error:any) {
         console.error(error);
        res.status(500).json({ message: error.message }); 
    }
}

// Controller for Google OAuth Login
import { OAuth2Client } from "google-auth-library";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Generate a random secure password for users logging in via Google for the first time
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new User({
                name: name || email.split("@")[0],
                email,
                password: hashedPassword,
            });
            await user.save();
        }

        req.session.isLoggedIn = true;
        req.session.userId = (user._id as any).toString();

        return res.json({
            message: "Signed in with Google successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error: any) {
        console.error("Google auth error:", error);
        res.status(500).json({ message: error.message || "Google authentication failed" });
    }
};
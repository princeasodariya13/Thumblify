import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./configs/db.js";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import AuthRouter from "./routes/AuthRoutes.js";
import ThumbnailRouter from "./routes/ThumbnailRoutes.js";
import UserRouter from "./routes/UserRoutes.js";
import ResetPassword from "./routes/ResetPassword.js";





declare module 'express-session' {
    interface SessionData {
        isLoggedIn: boolean;
        userId: string;
    }
}


await connectDB();



const app = express();



// Middleware
app.use(cors({
    origin:['http://localhost:5174', 'https://localhost:3000','http://localhost:5173'],
    credentials: true
}))

app.use(session({
    secret:process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite:process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/', // 7 day expiration
    },
    store : MongoStore.create({
        mongoUrl:process.env.MONGODB_URI as string,
        collectionName:'sessions'
    })
}))



app.use(express.json());




app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
// ✅ Mount ResetPassword under /api/auth so routes match:
// POST /api/auth/forgot-password
// POST /api/auth/verify-otp
// POST /api/auth/reset-password
app.use("/api/auth", ResetPassword);



app.use('/api/auth', AuthRouter);   

app.use('/api/thumbnail',ThumbnailRouter)

app.use('/api/user',UserRouter)


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
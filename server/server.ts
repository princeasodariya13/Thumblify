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

// Trust reverse proxy (e.g. Render / Heroku / Vercel) for HTTPS cookie session handling
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}




// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://localhost:3000',
    'https://thumblify-free.vercel.app',
];

if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // fallback allow for Vercel dynamic preview URLs
        }
    },
    credentials: true
}))

// Cross-Origin-Opener-Policy for Google OAuth popups
app.use((_req, res, next) => {
    res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});



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
import express from "express";
import { googleLoginUser, loginUser, logoutUser, registerUser, verifyUser } from "../controllers/AuthControllers.js";
import protect from "../middlewares/auth.js";


const AuthRouter = express.Router();

AuthRouter.post('/register', registerUser);
AuthRouter.post('/login', loginUser);
AuthRouter.post('/google', googleLoginUser);
AuthRouter.get('/verify', protect , verifyUser);
AuthRouter.post('/logout', protect , logoutUser);


export default AuthRouter;
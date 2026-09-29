import { createContext, useContext, useEffect, useState } from "react";
import type { IUser } from "../assets/assets";
import api from "../configs/api";
import toast from "react-hot-toast";
interface AuthContextProps{
    isLoggedIn : boolean;
    setIsLoggedIn : (isLoggedIn : boolean)=>void;
    user: IUser | null;
    setUser : (user : IUser | null) => void;
    login:(user:{email :string;password:string})=> Promise<void>;
    signUp:(user:{name:string;email :string;password:string})=> Promise<void>;
    googleLogin:(credential: string)=> Promise<void>;
    logout:()=>Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<boolean>;
    resetPassword: (email: string, newPassword: string, otp: string) => Promise<void>
}

const AuthContext = createContext<AuthContextProps>({
    isLoggedIn : false,
    setIsLoggedIn : ()=>{},
    user:null,
    setUser:()=>{},
    login:async()=>{},
    signUp:async()=>{},
    googleLogin:async()=>{},
    logout:async()=>{},
    forgotPassword: async () => {},
    verifyOtp: async () => false,
    resetPassword: async () => {}

})



export const AuthProvider = ({children}:{children : React.ReactNode})=>{

    const [user,setUser] = useState<IUser | null>(null)
    const [isLoggedIn,setIsLoggedIn] = useState<boolean>(false)

    const signUp = async({name,email,password} : {name:string;email:string;password:string;})=>{

        try {
            
            const {data} = await api.post('/api/auth/register',{name,email,password})

            if(data.user){
                setUser(data.user as IUser)
                setIsLoggedIn(true)

            }

            toast.success(data.message)
        } catch (error) {
            console.log(error)
        }
        
    }

     const login = async({email,password} : {email:string;password:string;})=>{
        try {
            
            const {data} = await api.post('/api/auth/login',{email,password})

            if(data.user){
                setUser(data.user as IUser)
                setIsLoggedIn(true)

            }

            toast.success(data.message)
        } catch (error) {
            console.log(error)
        }
    }

     const googleLogin = async (token: string) => {
        try {
            const { data } = await api.post('/api/auth/google', { token });
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }
            toast.success(data.message || "Signed in with Google successfully!");
        } catch (error: any) {
            console.error("Google Auth error:", error);
            const message = error.response?.data?.message || 'Google Login failed';
            toast.error(message);
        }
    };

     const logout = async()=>{
         try {
            
            const {data} = await api.post('/api/auth/logout')

            setUser(null)
            setIsLoggedIn(false)

            toast.success(data.message)
        } catch (error) {
            console.log(error)
        }
    }

    const fetchUser = async()=>{
        try {     
            const {data} = await api.get(`/api/auth/verify`);

            if(data.user) {
                setUser(data.user as IUser)
                setIsLoggedIn(true)
            }

        } catch (error : any) {
            if (error.response?.status === 401) {
      // ✅ user not logged in → ignore
      setUser(null);
    } else {
      console.error("Auth error:", error);
    }
        }
    }


const forgotPassword = async (email: string) => {
  try {
    const { data } = await api.post('/api/auth/forgot-password', { email });
    toast.success(data.message); 
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to send reset email';
    toast.error(message);
    throw new Error(message);
  }
};

const verifyOtp = async (email: string, otp: string) => {
  try {
    const { data } = await api.post('/api/auth/verify-otp', { email, otp });
    return data.success === true;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Invalid OTP';
    toast.error(message);
    throw new Error(message);
  }
};

const resetPassword = async (email: string, newPassword: string, otp: string) => {
  try {
    const { data } = await api.post('/api/auth/reset-password', { email, newPassword, otp });
    toast.success(data.message);
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to reset password';
    toast.error(message);
    throw new Error(message);
  }
};



    useEffect(()=>{
        (async ()=>{
            await fetchUser();
        })();
    },[])

    const value = {
  user, setUser,
  isLoggedIn, setIsLoggedIn,
  signUp, login, googleLogin, logout,
  forgotPassword, verifyOtp, resetPassword
};


    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = () => useContext(AuthContext)
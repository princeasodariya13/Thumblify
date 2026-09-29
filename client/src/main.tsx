import { createRoot } from 'react-dom/client'
import App from './App.js'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from "./context/AuthContext"
import { GoogleOAuthProvider } from "@react-oauth/google"

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "12426575748-3v5sgdqls8sk0h8su0j6oi0qq1i24q47.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </GoogleOAuthProvider>,
)
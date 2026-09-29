import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import LenisScroll from "./components/LenisScroll";
import Generate from "./pages/Generate";
import MyGeneration from "./pages/MyGeneration";
import YtPreview from "./pages/YtPreview";
import Login from "./components/Login";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import AboutPage from "./pages/AboutPage";
// import ContactForm from "./pages/ContactPage";
import ContactSection from "./sections/ContactSection";
import ForgetPassword from "./components/ForgetPassword";
import Community from "./pages/Community";

export default function App() {
    
    const {pathname} = useLocation()
    useEffect(()=>{
        window.scrollTo(0,0)
    },[pathname])
    
    return (
        <>
            <Toaster/>
            <LenisScroll />
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/generate" element={<Generate />} />
                <Route path="/generate/:id" element={<Generate />} />
                <Route path="/my-generation" element={<MyGeneration />} />
                <Route path="/preview" element={<YtPreview />} />
                <Route path="/community" element={<Community />} />
                <Route path="/login" element={<Login />} />

                <Route path="/about" element={<AboutPage/>}/>
                <Route path="/contact" element={<ContactSection/>}/>


                <Route path="//forgetpassword" element={<ForgetPassword/>}/>

            </Routes>
            <Footer />
        </>
    );
}
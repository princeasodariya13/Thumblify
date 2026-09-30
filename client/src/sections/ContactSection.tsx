'use client'
import { useState } from "react";
import SectionTitle from "../components/SectionTitle";
import { ArrowRightIcon, MailIcon, UserIcon, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import api from "../configs/api";

export default function ContactSection() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const validateForm = () => {
        let newErrors: any = {};

        if (!formData.name.trim()) newErrors.name = "Name required";
        if (!formData.email.trim()) newErrors.email = "Email required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Invalid email";

        if (!formData.message.trim()) newErrors.message = "Message required";
        else if (formData.message.length < 10)
            newErrors.message = "Minimum 10 characters";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev: any) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setStatus("idle");

        try {
            await api.post("/api/contact/send", {
                name: formData.name,
                email: formData.email,
                message: formData.message,
            });

            setStatus("success");
            setFormData({ name: "", email: "", message: "" });
        } catch (err: any) {
            console.error("Nodemailer contact submission error:", err);
            setStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="px-4 md:px-16 lg:px-24 xl:px-32">
            <SectionTitle
                text1="Contact"
                text2="Grow your channel"
                text3="Have questions about our Thumbnail Generator? Let's talk."
            />

            <form
                onSubmit={handleSubmit}
                className='grid sm:grid-cols-2 gap-3 sm:gap-5 max-w-2xl mx-auto text-slate-300 mt-16 w-full'
            >

                {/* NAME */}
                <motion.div initial={{ y: 150, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}>
                    <p className='mb-2 font-medium'>Your name</p>
                    <div className='flex items-center pl-3 rounded-lg border border-slate-700 focus-within:border-pink-500'>
                        <UserIcon className='size-5' />
                        <input
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            type="text"
                            placeholder='Enter your name'
                            className='w-full p-3 outline-none bg-transparent'
                        />
                    </div>
                    {errors.name && <p className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle className="size-3" />{errors.name}</p>}
                </motion.div>

                {/* EMAIL */}
                <motion.div initial={{ y: 150, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}>
                    <p className='mb-2 font-medium'>Email id</p>
                    <div className='flex items-center pl-3 rounded-lg border border-slate-700 focus-within:border-pink-500'>
                        <MailIcon className='size-5' />
                        <input
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            placeholder='Enter your email'
                            className='w-full p-3 outline-none bg-transparent'
                        />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle className="size-3" />{errors.email}</p>}
                </motion.div>

                {/* MESSAGE */}
                <motion.div className='sm:col-span-2' initial={{ y: 150, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}>
                    <p className='mb-2 font-medium'>Message</p>
                    <textarea
                        name='message'
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        placeholder='Enter your message'
                        className='focus:border-pink-500 resize-none w-full p-3 outline-none rounded-lg border border-slate-700 bg-transparent'
                    />
                    {errors.message && <p className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle className="size-3" />{errors.message}</p>}
                </motion.div>

                {/* BUTTON & STATUS MESSAGE */}
                <motion.div className="sm:col-span-2 flex flex-wrap items-center gap-4 mt-2" initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }}>
                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className='w-max flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-10 py-3 rounded-full disabled:opacity-50 transition cursor-pointer'
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                Submit
                                <ArrowRightIcon className="size-5" />
                            </>
                        )}
                    </button>

                    {/* ✅ Status Messages */}
                    {status === "success" && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium"
                        >
                            <CheckCircle className="size-4.5 text-emerald-400" />
                            Message sent successfully!
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-medium"
                        >
                            <AlertCircle className="size-4.5 text-red-400" />
                            Failed to send message
                        </motion.div>
                    )}
                </motion.div>

            </form>
        </div>
    );
}
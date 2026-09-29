'use client'
import { useState } from "react";
import SectionTitle from "../components/SectionTitle";
import { ArrowRightIcon, MailIcon, UserIcon, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import emailjs from "@emailjs/browser";

export default function ContactSection() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    // ✅ EmailJS config
    const SERVICE_ID = 'service_s98ru0b';
    const ADMIN_TEMPLATE = 'template_f5xl2bm';
    const USER_TEMPLATE = 'template_c4dbh9k';
    const PUBLIC_KEY = 'UeQsCw1C80-_HVdJL';

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

        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            message: formData.message,
        };

        try {
            const adminRes = await emailjs.send(
                SERVICE_ID,
                ADMIN_TEMPLATE,
                templateParams,
                PUBLIC_KEY
            );

            const userRes = await emailjs.send(
                SERVICE_ID,
                USER_TEMPLATE,
                templateParams,
                PUBLIC_KEY
            );

            if (adminRes.status === 200 && userRes.status === 200) {
                setStatus("success");
                setFormData({ name: "", email: "", message: "" });
            } else {
                throw new Error();
            }
        } catch (err) {
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

            {/* ✅ Status Messages */}
            {status === "success" && (
                <div className="flex items-center gap-2 text-green-400 mb-4">
                    <CheckCircle className="size-5" />
                    Message sent successfully!
                </div>
            )}

            {status === "error" && (
                <div className="flex items-center gap-2 text-red-400 mb-4">
                    <AlertCircle className="size-5" />
                    Failed to send message
                </div>
            )}

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

                {/* BUTTON */}
                <motion.button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-max flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-10 py-3 rounded-full disabled:opacity-50'
                    initial={{ y: 150, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
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
                </motion.button>

            </form>
        </div>
    );
}
import { footerData } from "../data/footer";
import { DribbbleIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from "lucide-react";
import { motion } from "motion/react";
import type { IFooterLink } from "../types";
import { Link } from "react-router-dom";

export default function Footer() {
    const handleLinkClick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="flex flex-wrap justify-center md:justify-between overflow-hidden gap-10 md:gap-20 mt-40 py-6 px-6 md:px-16 lg:px-24 xl:px-32 text-[13px] text-gray-500">
            <motion.div className="flex flex-wrap items-start gap-10 md:gap-35"
                initial={{ x: -150, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
            >
                <Link to='/' onClick={handleLinkClick}>
                    <img className="size-8 aspect-square" src="/favicon.svg" alt="footer logo" width={32} height={32} />
                </Link>
                {footerData.map((section, index) => (
                    <div key={index}>
                        <p className="text-slate-100 font-semibold mb-2">{section.title}</p>
                        <ul className="space-y-2">
                            {section.links.map((link: IFooterLink, idx: number) => (
                                <li key={idx}>
                                    <Link 
                                        to={link.href} 
                                        onClick={handleLinkClick}
                                        className="hover:text-pink-600 transition duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </motion.div>
            <motion.div className="flex flex-col max-md:items-center max-md:text-center gap-2 items-end"
                initial={{ x: 150, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
            >
                <p className="max-w-60">Making every creator feel valued—no matter the size of your audience.</p>
                <div className="flex items-center gap-4 mt-3">
                    <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" title="Dribbble">
                        <DribbbleIcon className="size-5 hover:text-pink-500 transition duration-200 cursor-pointer" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                        <LinkedinIcon className="size-5 hover:text-pink-500 transition duration-200 cursor-pointer" />
                    </a>
                    <a href="https://x.com" target="_blank" rel="noopener noreferrer" title="X (Twitter)">
                        <TwitterIcon className="size-5 hover:text-pink-500 transition duration-200 cursor-pointer" />
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube">
                        <YoutubeIcon className="size-6 hover:text-pink-500 transition duration-200 cursor-pointer" />
                    </a>
                </div>
                <p className="mt-3 text-center">&copy; {new Date().getFullYear()} <Link to="/" onClick={handleLinkClick} className="font-medium hover:text-pink-600 transition">Thumblify</Link></p>
            </motion.div>
        </footer>
    );
}
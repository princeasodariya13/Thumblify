import type { IFooter } from "../types";

export const footerData: IFooter[] = [
    {
        title: "Product",
        links: [
            { name: "Home", href: "/" },
            { name: "Generate", href: "/generate" },
            { name: "My Generations", href: "/my-generation" },
            { name: "Community", href: "/community" },
        ]
    },
    {
        title: "Company",
        links: [
            { name: "About us", href: "/about" },
            { name: "Contact us", href: "/contact" },
            { name: "Community", href: "/community" },
        ]
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy Policy", href: "/about" },
            { name: "Terms of Service", href: "/about" },
            { name: "Refund Policy", href: "/about" },
        ]
    }
];
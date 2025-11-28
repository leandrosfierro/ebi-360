import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    light: "#0ea5e9",
                    DEFAULT: "#0284c7",
                    dark: "#0f172a",
                },
                accent: {
                    purple: "#8B5CF6",
                    pink: "#EC4899",
                    blue: "#3B82F6",
                    green: "#10B981",
                    yellow: "#F59E0B",
                    teal: "#14B8A6",
                },
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            backgroundImage: {
                "gradient-primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "gradient-secondary": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                "gradient-success": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                "gradient-warm": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                "gradient-cool": "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                "gradient-purple-pink": "linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            },
            backdropBlur: {
                xs: "2px",
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", "sans-serif"],
                mono: ["var(--font-geist-mono)", "monospace"],
            },
            boxShadow: {
                glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
                "glass-lg": "0 12px 48px 0 rgba(31, 38, 135, 0.2)",
            },
        },
    },
    plugins: [],
};
export default config;

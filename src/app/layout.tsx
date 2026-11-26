import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Learning to Fail",
    description: "Interactive pixel-art presentation",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
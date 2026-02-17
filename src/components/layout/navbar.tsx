'use client';

import { LoginButton } from "@/components/auth/login-button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-4 sm:top-6 inset-x-0 z-50 flex justify-center pointer-events-none px-3 sm:px-0">
            <nav className={cn(
                "glass-dark rounded-full flex items-center justify-between px-6 py-3 transition-all duration-500 pointer-events-auto",
                scrolled ? "w-full sm:w-[90%] md:w-[70%] lg:w-[50%] shadow-2xl translate-y-2" : "w-full sm:w-[95%] md:w-[85%] shadow-lg"
            )}>
                <div className="flex items-center gap-3">
                    <Image
                        src="/dChat.svg"
                        alt="dChat Logo"
                        width={50}
                        height={50}
                        className="ml-4rounded-full scale-150"
                        onClick={() => router.push('/')}
                        priority
                    />
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="#features" className="hover:text-foreground transition-colors relative group">
                        Features
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                    <Link href="#privacy" className="hover:text-foreground transition-colors relative group">
                        Privacy
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                    <Link href="https://docs.xmtp.org" target="_blank" className="hover:text-foreground transition-colors relative group">
                        Docs
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                </div>

                <div className="pl-4 sm:pl-6 border-l border-border/50">
                    <LoginButton />
                </div>
            </nav>
        </div>
    );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";

export function LandingNav() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/50"
    >
      <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
        <Sparkles className="w-5 h-5 text-primary" />
        <span>CreatorVault</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6">
        <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Features
        </Link>
        <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Pricing
        </Link>
        <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          About
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link href="/signin">Sign In</Link>
        </Button>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/signup">Get Started</Link>
        </Button>
      </div>
    </motion.header>
  );
}

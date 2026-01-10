"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden text-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background/50 z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl"
      >
        <h1 className="text-5xl font-bold tracking-tighter sm:text-7xl xl:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
          Capture Your <br />
          <span className="text-primary">Next Big Idea</span>
        </h1>

        <p className="mt-6 text-xl text-muted-foreground sm:text-2xl max-w-2xl mx-auto">
          The privacy-first idea manager for content creators. Capture, organize, and develop your content without distractions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button asChild size="lg" className="rounded-full h-12 px-8 text-lg font-medium">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-8 text-lg font-medium">
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </motion.div>

      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    </section>
  );
}

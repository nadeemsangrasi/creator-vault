"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Sparkles, PenTool, Rocket } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    title: "Capture the Spark",
    description: "Don't let ideas vanish. Capture them instantly in your vault, tagging them by topic or format.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: PenTool,
    title: "Develop & Refine",
    description: "Flesh out your concepts with notes, research, and outlines without leaving your flow state.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Rocket,
    title: "Publish & SHIP",
    description: "Track your content through production stages until it's live for your audience to see.",
    color: "bg-green-500/10 text-green-500",
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section className="py-24 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            From chaos to <span className="text-primary">published</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A simple, linear workflow that respects your creative process.
          </p>
        </div>

        <div ref={containerRef} className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-[50%] top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-24">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                  idx % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 text-center md:text-right">
                  {idx % 2 === 0 && (
                    <div className="md:text-right">
                      <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  )}
                  {idx % 2 === 1 && (
                    <div className="flex justify-center md:justify-end">
                      <div className={`w-32 h-32 rounded-2xl ${step.color} flex items-center justify-center`}>
                        <step.icon className="w-12 h-12" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full border-4 border-background ${step.color.replace("text-", "bg-").replace("/10", "")} flex items-center justify-center text-white font-bold`}>
                    {idx + 1}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  {idx % 2 === 1 && (
                    <div className="md:text-left">
                      <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  )}
                  {idx % 2 === 0 && (
                    <div className="flex justify-center md:justify-start">
                      <div className={`w-32 h-32 rounded-2xl ${step.color} flex items-center justify-center`}>
                        <step.icon className="w-12 h-12" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Lightbulb, Shield, Zap, Layout, Smartphone, Share2 } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Quick Capture",
    description: "Capture ideas instantly before they slip away. Designed for speed and minimal friction.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your ideas are yours alone. End-to-end encryption ensures your creative vault stays private.",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Move ideas from spark to published content with customizable workflow stages.",
  },
  {
    icon: Layout,
    title: "Distraction Free",
    description: "A clean, minimalist interface that helps you focus on what matters: your creativity.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Access your vault from any device. Your ideas sync seamlessly across desktop and mobile.",
  },
  {
    icon: Share2,
    title: "Easy Export",
    description: "Export your content to your favorite platforms with a single click when you're ready.",
  },
];

export function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything you need to <span className="text-primary">create better content</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful tools designed specifically for the modern content creator's workflow.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

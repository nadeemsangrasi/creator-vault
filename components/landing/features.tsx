'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Shield,
  Sparkles,
  Zap,
  Lock,
  LayoutGrid,
  GitBranch,
  Database,
  Globe,
  Smartphone,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'AES-256 encryption ensures your ideas never leave your control. Your data, your rules.',
  },
  {
    icon: LayoutGrid,
    title: 'Smart Organization',
    description: 'Tags, stages, and priority levels help you track ideas from spark to publication.',
  },
  {
    icon: Zap,
    title: 'Instant Search',
    description: 'Find any idea in milliseconds with our powerful semantic search engine.',
  },
  {
    icon: GitBranch,
    title: 'Version History',
    description: 'Track every change. Never lose a brilliant thought with automatic versioning.',
  },
  {
    icon: Database,
    title: 'Offline First',
    description: 'Work anywhere. Your ideas sync automatically when you reconnect.',
  },
  {
    icon: Globe,
    title: 'Collaborate Securely',
    description: 'Share ideas with encrypted links. Control who sees what and when.',
  },
  {
    icon: Smartphone,
    title: 'Responsive Design',
    description: 'Capture ideas on any device. Your workspace travels with you.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description: 'Get intelligent suggestions to develop and connect your ideas.',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'We never sell your data. Period. Your ideas stay yours forever.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to protect your ideas while helping them flourish
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group p-6 bg-background rounded-xl border border-border hover:border-primary/50 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

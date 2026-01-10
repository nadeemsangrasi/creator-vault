import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingNav } from "@/components/layout/landing-nav";

export default function Home() {
  return (
    <main className="min-h-screen">
      <LandingNav />
      <Hero />
      <Features />
      <HowItWorks />

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>© 2026 CreatorVault. All rights reserved.</p>
      </footer>
    </main>
  );
}

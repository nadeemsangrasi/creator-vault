"use client";

import { UserMenu } from "@/components/auth/user-menu";
import { Sparkles, LayoutDashboard, Lightbulb } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Ideas", href: "/ideas", icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center gap-4 sm:gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>CreatorVault</span>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-4">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <MobileMenu />
            <UserMenu />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="container py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

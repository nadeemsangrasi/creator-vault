import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, SunMoon } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { Sparkles, LayoutDashboard, Lightbulb } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ThemeToggle } from "../theme-toggle";

export function MobileMenu() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Ideas", href: "/ideas", icon: Lightbulb },
  ];

  return (
    <Sheet>
      <div className="flex items-center gap-2">
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent side="left" className="w-64">
        <div className="flex flex-col h-full pt-6">
          <div className="flex items-center gap-2 font-bold text-xl mb-8">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>CreatorVault</span>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
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

          <div className="mt-auto pt-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SunMoon className="h-4 w-4" />
                <span className="text-sm font-medium">Theme</span>
              </div>
              <ThemeToggle />
            </div>
            <UserMenu />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
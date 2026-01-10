import { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/signin-form";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Sign In - CreatorVault",
  description: "Sign in to your CreatorVault account",
};

export default function SignInPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Sparkles className="w-5 h-5" />
            <span>CreatorVault</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;CreatorVault has completely transformed how I organize my content ideas. It's the clarity I've been looking for.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis, Content Creator</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-end">
              <ThemeToggle />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          <SignInForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/signup"
              className="hover:text-brand underline underline-offset-4"
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

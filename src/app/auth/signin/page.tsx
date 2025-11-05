"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || "Failed to sign in");
      } else if (result?.ok) {
        // Fetch the session to check if user has a tenant
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session?.user?.hasTenant && session?.user?.subdomain) {
          // User has a tenant, redirect to their workspace
          const isLocalhost = window.location.hostname === "localhost" || 
                             window.location.hostname === "127.0.0.1";
          
          if (isLocalhost) {
            window.location.href = `/app/tasks?tenant=${session.user.subdomain}`;
          } else {
            const protocol = window.location.protocol;
            const parts = window.location.host.split('.');
            const domain = parts.length > 1 ? parts.slice(-2).join('.') : window.location.host;
            window.location.href = `${protocol}//${session.user.subdomain}.${domain}/app/tasks`;
          }
        } else {
          // User doesn't have a tenant, redirect to onboarding
          router.push("/onboarding");
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Todo SaaS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Sign in to your account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-200" />
              <span className="mx-4 text-gray-400 text-xs">OR</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => signIn("google")}
            >
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_17_40)">
                  <path d="M47.532 24.552c0-1.636-.146-3.2-.418-4.704H24.48v9.02h13.02c-.56 3.02-2.24 5.58-4.78 7.3v6.06h7.74c4.54-4.18 7.07-10.34 7.07-17.676z" fill="#4285F4"/>
                  <path d="M24.48 48c6.48 0 11.92-2.14 15.89-5.82l-7.74-6.06c-2.14 1.44-4.88 2.3-8.15 2.3-6.26 0-11.56-4.22-13.46-9.9H2.5v6.22C6.46 43.78 14.7 48 24.48 48z" fill="#34A853"/>
                  <path d="M11.02 28.52c-.5-1.44-.8-2.98-.8-4.52s.3-3.08.8-4.52v-6.22H2.5A23.97 23.97 0 000 24c0 3.98.96 7.76 2.5 11.22l8.52-6.7z" fill="#FBBC05"/>
                  <path d="M24.48 9.54c3.54 0 6.68 1.22 9.16 3.62l6.86-6.86C36.4 2.14 30.96 0 24.48 0 14.7 0 6.46 4.22 2.5 10.78l8.52 6.22c1.9-5.68 7.2-9.9 13.46-9.9z" fill="#EA4335"/>
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <path fill="#fff" d="M0 0h48v48H0z"/>
                  </clipPath>
                </defs>
              </svg>
              Sign in with Google
            </Button>

            <div className="mt-4 text-center text-sm">
              {"Don't have an account? "}
              <Link href="/auth/signup" className="underline text-primary">
                Sign up
              </Link>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-center text-gray-600 text-sm mb-3">Demo Credentials</p>
            <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 space-y-2">
              <div>
                <p className="font-semibold">Regular User:</p>
                <p>Email: <code className="font-mono">demo@example.com</code></p>
                <p>Password: <code className="font-mono">password123</code></p>
              </div>
              <div className="pt-2 border-t">
                <p className="font-semibold">Admin User:</p>
                <p>Email: <code className="font-mono">admin@example.com</code></p>
                <p>Password: <code className="font-mono">admin123!</code></p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

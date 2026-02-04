import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/logo1_1770205562697.jpg";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  if (isLoading) return null;
  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const err = await res.json();
        toast({
          title: "Login Failed",
          description: err.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <img src={logoUrl} alt="BeTTI Logo" className="w-24 h-24 object-contain" />
            <h1 className="text-2xl font-bold text-primary">BeTTI LMS</h1>
            <p className="text-muted-foreground text-center">
              Belgut Technical Training Institute Learning Management System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Admission / Staff Number</Label>
              <Input
                id="username"
                placeholder="e.g. SCM/6155/25S"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Use your institute credentials to access the portal.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

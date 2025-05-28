
"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// WARNING: This is a hardcoded password for a non-secure prototype login.
// DO NOT use this in a production environment.
const ADMIN_PASSWORD = "adminpass";

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password === ADMIN_PASSWORD) {
      try {
        localStorage.setItem('isAdminAuthenticated', 'true');
        toast({
          title: "Success",
          description: "Login successful. Redirecting to admin panel...",
        });
        router.push('/admin');
      } catch (e) {
        setError("Could not set authentication status. LocalStorage might be disabled or full.");
      }
    } else {
      setError('Incorrect password. Please try again.');
      toast({
        title: "Login Failed",
        description: "Incorrect password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Please enter the password to access the admin panel.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background text-foreground border-input"
              />
            </div>
            {error && (
              <div className="flex items-center text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
             <p className="text-xs text-muted-foreground text-center pt-2">
              (Hint: for this prototype, the password is "{ADMIN_PASSWORD}")
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-background text-foreground hover:bg-background/90">
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

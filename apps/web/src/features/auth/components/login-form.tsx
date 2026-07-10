'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import { Input, PasswordInput } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/card';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
        <CardDescription>
          Access your digital memory space and stories.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <div className="flex items-center justify-between text-sm mt-1">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
          <div className="text-center text-xs text-muted-foreground mt-2">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-foreground hover:underline">
              Create one
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

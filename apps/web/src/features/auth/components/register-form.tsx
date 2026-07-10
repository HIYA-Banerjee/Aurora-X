'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import { Input, PasswordInput } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/card';

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await register(email, password, displayName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription>
          Get started with your personalized memory capsule.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Display Name"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isLoading}
            required
          />
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
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Create Account
          </Button>
          <div className="text-center text-xs text-muted-foreground mt-2">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-foreground hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

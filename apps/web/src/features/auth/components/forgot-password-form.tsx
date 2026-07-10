'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/card';
import { useToastStore } from '../../../store/toast-store';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToastStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      addToast({
        title: 'Reset Link Sent',
        description: 'Please check your email address for instructions.',
        type: 'success',
      });
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md border border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive a recovery link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              We have sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
            </p>
            <Link href="/login" className="mt-2 text-sm font-semibold text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
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
            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Send Reset Link
            </Button>
            <div className="text-center text-xs text-muted-foreground mt-2">
              Remember your password?{' '}
              <Link href="/login" className="font-semibold text-foreground hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

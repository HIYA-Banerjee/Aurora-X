'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PasswordInput } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/card';
import { useToastStore } from '../../../store/toast-store';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToastStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      addToast({
        title: 'Password Updated',
        description: 'Your password was successfully reset. You can now login.',
        type: 'success',
      });
      router.push('/login');
    }, 1200);
  };

  return (
    <Card className="w-full max-w-md border border-border/80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
        <CardDescription>
          Choose a secure new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PasswordInput
            label="New Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

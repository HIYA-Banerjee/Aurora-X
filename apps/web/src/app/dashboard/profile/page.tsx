'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Avatar } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { User as UserIcon, Camera } from 'lucide-react';
import { useAuth } from '../../../context/auth-context';
import { useToastStore } from '../../../store/toast-store';

export default function ProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToastStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');

  const handleSave = () => {
    addToast({ title: 'Profile Updated', description: 'Your profile changes were recorded.', type: 'success' });
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal details and public presentation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-border/60 pt-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                <Avatar src={user?.avatar} name={user?.displayName || user?.email} size="lg" />
                <button className="absolute inset-0 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <CardTitle className="text-base font-bold">{user?.displayName || 'User profile'}</CardTitle>
                <CardDescription className="text-xs mt-0.5">{user?.role} Account</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input label="Email Address" value={email} disabled required />
              <Input
                label="Display Name"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button variant="primary" onClick={handleSave}>Save Changes</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

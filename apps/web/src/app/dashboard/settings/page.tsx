'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, Switch } from '../../../components/ui/forms';
import { Button } from '../../../components/ui/button';
import { Settings, Lock, Bell } from 'lucide-react';
import { useToastStore } from '../../../store/toast-store';

export default function SettingsPage() {
  const { addToast } = useToastStore();

  const handleSave = () => {
    addToast({ title: 'Preferences Saved', description: 'Your options were updated.', type: 'success' });
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Customize and configure your memory space and profile preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-border/60 pt-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* General Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-base font-bold">Workspace Preferences</CardTitle>
              </div>
              <CardDescription>Default options for your memories dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Select
                label="Default Memory Visibility"
                value="PRIVATE"
                options={[
                  { label: 'Private (Only You)', value: 'PRIVATE' },
                  { label: 'Shared (Close contacts)', value: 'SHARED' },
                  { label: 'Public (Open)', value: 'PUBLIC' },
                ]}
                onChange={() => {}}
              />
              <Switch label="Auto-save memory drafts locally" checked={true} onChange={() => {}} />
              <Switch label="Enable telemetry diagnostics logging" checked={true} onChange={() => {}} />
            </CardContent>
            <CardFooter>
              <Button variant="primary" onClick={handleSave}>Save Changes</Button>
            </CardFooter>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-base font-bold">Security Settings</CardTitle>
              </div>
              <CardDescription>Configure credentials and authentication checks.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input label="New Password" type="password" placeholder="••••••••" />
              <Input label="Confirm New Password" type="password" placeholder="••••••••" />
            </CardContent>
            <CardFooter>
              <Button variant="outline">Change Password</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

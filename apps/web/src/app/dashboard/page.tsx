'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/auth-context';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Brain, Image as ImageIcon, BookOpen, MessageSquare, Plus, ArrowRight, Sparkles, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Skeleton } from '../../components/ui/skeleton';

export default function DashboardHome() {
  const { user } = useAuth();

  // Fetch recent memories to display on the dashboard
  const { data: memoriesData, isLoading: memoriesLoading } = useQuery({
    queryKey: ['recent-memories'],
    queryFn: async () => {
      const res = (await api.get('/api/v1/memories?limit=3')) as any;
      return res.items || [];
    },
  });

  const stats = [
    { label: 'Memories Captured', count: '42', icon: <Brain className="h-5 w-5 text-indigo-500" />, desc: 'Moments written down' },
    { label: 'Stories Created', count: '12', icon: <BookOpen className="h-5 w-5 text-amber-500" />, desc: 'AI narrative timelines' },
    { label: 'Media Assets', count: '85', icon: <ImageIcon className="h-5 w-5 text-emerald-500" />, desc: 'Uploaded photos & videos' },
    { label: 'AI Sessions', count: '15', icon: <MessageSquare className="h-5 w-5 text-blue-500" />, desc: 'Conversations logged' },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Welcome Message banner */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome back, {user?.displayName || 'User'}
        </h1>
        <p className="text-muted-foreground text-sm">
          Here is an overview of your digital memory capsule. What would you like to capture today?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              <div className="p-1.5 bg-muted rounded-lg">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stat.count}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main split dashboard section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Recent memories */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Recent Memories</h2>
            <Link href="/dashboard/memories" className="text-xs font-semibold hover:underline flex items-center gap-1">
              View all memories <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {memoriesLoading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="border border-border rounded-xl p-5 flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))
            ) : memoriesData && memoriesData.length > 0 ? (
              memoriesData.map((mem: any) => (
                <Card key={mem.id} className="hover:border-zinc-300 dark:hover:border-zinc-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold truncate max-w-[80%]">
                        {mem.title}
                      </CardTitle>
                      {mem.favorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                    </div>
                    {mem.eventDate && (
                      <CardDescription className="text-xs">
                        {new Date(mem.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-3 text-sm text-muted-foreground line-clamp-2">
                    {mem.description || 'No description provided.'}
                  </CardContent>
                  <CardFooter className="pt-2 pb-3 text-xs flex justify-between items-center text-muted-foreground bg-zinc-50/20">
                    <span>📍 {mem.location || 'Unknown Location'}</span>
                    <Link href={`/dashboard/memories/${mem.id}`} className="font-semibold text-primary hover:underline">
                      Open Memory
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
                No memories captured yet.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Quick Actions & Slogan */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold tracking-tight">Quick Actions</h2>
          <Card className="flex flex-col gap-3 p-6">
            <Link href="/dashboard/memories/new" className="w-full">
              <Button variant="primary" className="w-full" leftIcon={<Plus className="h-4 w-4" />}>
                Write New Memory
              </Button>
            </Link>
            <Link href="/dashboard/conversations" className="w-full">
              <Button variant="outline" className="w-full" leftIcon={<MessageSquare className="h-4 w-4" />}>
                Talk to AI Assistant
              </Button>
            </Link>
            <Link href="/dashboard/photos" className="w-full">
              <Button variant="secondary" className="w-full" leftIcon={<ImageIcon className="h-4 w-4" />}>
                Upload Photos
              </Button>
            </Link>
          </Card>

          {/* AI Sparkles banner panel */}
          <Card className="bg-linear-to-br from-indigo-500/10 to-violet-500/10 border-indigo-200/20 p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
              <span className="font-bold text-sm tracking-wide uppercase">AI Recommendations</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on your recent memories from last month, the system suggests writing about your summer vacation.
            </p>
            <Link href="/dashboard/recommendations" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-2">
              View recommendation details →
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

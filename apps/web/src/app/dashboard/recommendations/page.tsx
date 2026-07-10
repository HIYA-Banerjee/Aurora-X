'use client';

import React from 'react';
import { Sparkles, Calendar, Heart } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function RecommendationsPage() {
  const recommendations = [
    {
      title: 'Summer Travel Timeline',
      reason: 'Based on 5 tags containing #summer and #vacation from Paris.',
      actionLabel: 'Generate narrative story',
      icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
    },
    {
      title: 'Reflect on Joyful Moments',
      reason: 'You had a surge of Joy emotion logs over the weekend.',
      actionLabel: 'Discuss in AI chat',
      icon: <Heart className="h-5 w-5 text-emerald-500" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Recommendations</h1>
        <p className="text-muted-foreground text-sm">
          Get suggested narrative timelines, reflection topics, and story structures based on your memories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border/60 pt-6">
        {recommendations.map((rec, idx) => (
          <Card key={idx} className="bg-linear-to-br from-indigo-500/5 to-violet-500/5 border-indigo-200/20">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 bg-card border border-border rounded-xl">{rec.icon}</div>
              <div>
                <CardTitle className="text-base font-bold">{rec.title}</CardTitle>
                <CardDescription className="text-xs mt-0.5">Recommendation suggestion</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{rec.reason}</p>
              <Button variant="secondary" className="w-fit self-end">
                {rec.actionLabel}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

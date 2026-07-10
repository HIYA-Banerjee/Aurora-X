'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, User, Brain } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Avatar } from '../../../components/ui/avatar';
import { useAuth } from '../../../context/auth-context';

export default function ConversationsPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I am your Aurora-X memory assistant. I can scan your journals and memories to summarize events, extract emotions, or query information. What would you like to explore today?",
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `I've analyzed your memories regarding "${userMsg}". Currently in this phase, AI RAG integrations are simulated. You can review your logs and memories in the main dashboard view.`,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full gap-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Memory Chat</h1>
        <p className="text-muted-foreground text-sm">
          Discuss your memories and get insights directly from your digital timelines.
        </p>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 flex gap-4 min-h-0 border-t border-border/60 pt-4">
        {/* Left Side: Mock Sessions list */}
        <div className="hidden md:flex w-64 flex-col gap-2 border-r border-border/40 pr-4">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" leftIcon={<MessageSquare className="h-4 w-4" />}>
            New Session
          </Button>
          <div className="flex-1 overflow-y-auto space-y-1">
            <button className="flex items-center gap-3 w-full text-left p-2.5 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 font-semibold cursor-pointer">
              <MessageSquare className="h-4 w-4 shrink-0 text-indigo-500" />
              <span className="truncate">General Memory Search</span>
            </button>
          </div>
        </div>

        {/* Right Side: Chat Area */}
        <Card className="flex-1 flex flex-col min-h-0 overflow-hidden bg-card/20 border border-border/80">
          {/* Chat message viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[80%] ${!isAssistant && 'ml-auto flex-row-reverse'}`}
                >
                  <Avatar
                    src={isAssistant ? null : user?.avatar}
                    name={isAssistant ? 'AI' : user?.displayName || user?.email}
                    size="sm"
                    className={isAssistant ? 'bg-indigo-500 text-white' : ''}
                  />
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${isAssistant ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground border border-border/40' : 'bg-primary text-primary-foreground'}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form Input bar */}
          <form onSubmit={handleSend} className="p-3 border-t border-border/40 bg-zinc-50/50 dark:bg-zinc-950/20 flex gap-2">
            <input
              type="text"
              placeholder="Ask about your yesterday, travel memories, or emotions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-card text-foreground px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <Button type="submit" variant="primary" className="h-10 w-10 p-0 rounded-lg">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

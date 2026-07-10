import React from 'react';
import RegisterForm from '../../features/auth/components/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-radial from-zinc-100 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-zinc-100/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md">
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-transparent dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-500">
            AURORA-X
          </h1>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Memory Intelligence Engine
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

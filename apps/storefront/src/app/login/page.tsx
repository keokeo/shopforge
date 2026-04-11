'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { user, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 已登录则跳转
  if (user) {
    router.push(redirectPath);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      router.push(redirectPath);
    } catch (err: any) {
      if (err.status === 401) {
        setError('Invalid credentials. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center mb-16">
          <div className="w-px h-12 bg-stone-300 mx-auto mb-8" />
          <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-tight mb-4">
            Welcome Back
          </h1>
          <p className="text-sm font-light text-stone-500">
            Sign in to your account to continue.
          </p>
        </motion.div>

        <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="py-3 text-center text-xs uppercase tracking-widest text-red-800 border border-red-200 bg-red-50/50">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3">
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pb-3 bg-transparent border-b border-stone-200 text-ink text-sm font-light focus:outline-none focus:border-ink transition-colors placeholder:text-stone-300"
              placeholder="Enter your username or email"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pb-3 bg-transparent border-b border-stone-200 text-ink text-sm font-light focus:outline-none focus:border-ink transition-colors placeholder:text-stone-300"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-500 mt-4 ${
              loading
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200'
                : 'bg-ink text-paper hover:bg-stone-900 border border-ink'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </motion.form>

        <motion.div variants={fadeUp} className="mt-12 text-center">
          <span className="text-sm font-light text-stone-500">Don&apos;t have an account? </span>
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
            className="text-xs uppercase tracking-widest text-ink font-semibold hover:text-stone-500 transition-colors border-b border-ink hover:border-stone-500 pb-0.5"
          >
            Create One
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}


'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-paper border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl font-serif font-medium text-ink tracking-tight">
              ShopForge.
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-sm tracking-[0.1em] uppercase text-stone-500 hover:text-ink transition-colors">
              首页
            </Link>
            <Link href="/products" className="text-sm tracking-[0.1em] uppercase text-stone-500 hover:text-ink transition-colors">
              全部商品
            </Link>
            <Link href="/orders" className="text-sm tracking-[0.1em] uppercase text-stone-500 hover:text-ink transition-colors">
              我的订单
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <Link
              href="/cart"
              className="relative text-ink hover:text-stone-500 transition-colors"
            >
              <ShoppingBag strokeWidth={1.5} className="w-5 h-5" />
            </Link>

            {/* Auth State */}
            {!loading && (
              <div className="hidden md:flex items-center gap-6 border-l border-stone-200 pl-6">
                {user ? (
                  <>
                    <span className="text-sm tracking-widest text-stone-500 uppercase">
                      Hello, <span className="text-ink">{user.username}</span>
                    </span>
                    <button
                      onClick={logout}
                      className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-ink transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-ink transition-colors"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="text-xs uppercase tracking-[0.2em] px-5 py-2.5 bg-ink text-paper hover:bg-stone-800 transition-colors border border-ink"
                    >
                      注册
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-ink"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X strokeWidth={1.5} className="w-6 h-6" /> : <Menu strokeWidth={1.5} className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-6 space-y-4 border-t border-stone-200 mt-4 pt-4">
            <Link href="/" className="block text-sm tracking-[0.1em] uppercase text-ink hover:text-stone-500">
              首页
            </Link>
            <Link href="/products" className="block text-sm tracking-[0.1em] uppercase text-ink hover:text-stone-500">
              全部商品
            </Link>
            <Link href="/orders" className="block text-sm tracking-[0.1em] uppercase text-ink hover:text-stone-500">
              我的订单
            </Link>
            <Link href="/cart" className="block text-sm tracking-[0.1em] uppercase text-ink hover:text-stone-500">
              购物车
            </Link>
            <div className="border-t border-stone-200 pt-4 mt-4">
              {user ? (
                <>
                  <span className="block text-sm tracking-[0.1em] uppercase text-stone-500 mb-4">
                    Hello, <span className="text-ink">{user.username}</span>
                  </span>
                  <button
                    onClick={logout}
                    className="block text-sm tracking-[0.1em] uppercase text-red-800 hover:text-red-600"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/login" className="block text-sm tracking-[0.1em] uppercase text-ink hover:text-stone-500">
                    登录
                  </Link>
                  <Link href="/register" className="block text-center text-xs uppercase tracking-[0.2em] px-4 py-3 bg-ink text-paper hover:bg-stone-800 border border-ink">
                    注册
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

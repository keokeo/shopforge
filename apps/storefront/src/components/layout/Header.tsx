'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ShopForge
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              首页
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              全部商品
            </Link>
            <Link href="/orders" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              我的订单
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </Link>

            {/* Auth State */}
            {!loading && (
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <>
                    <span className="text-sm text-gray-600">
                      你好, <span className="font-medium text-gray-900">{user.username}</span>
                    </span>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      退出
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                    >
                      注册
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18 18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
              首页
            </Link>
            <Link href="/products" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
              全部商品
            </Link>
            <Link href="/orders" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
              我的订单
            </Link>
            <Link href="/cart" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
              购物车
            </Link>
            <div className="border-t border-gray-100 pt-2 mt-2">
              {user ? (
                <>
                  <span className="block px-3 py-2 text-sm text-gray-600">
                    你好, <span className="font-medium text-gray-900">{user.username}</span>
                  </span>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50">
                    登录
                  </Link>
                  <Link href="/register" className="block px-3 py-2 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50">
                    注册
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

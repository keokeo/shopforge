'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/store/cart';
import { ordersApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { state, dispatch, totalItems, totalPrice } = useCart();
  const { user, token, loading: authLoading } = useAuth();

  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load draft from session storage on mount
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem('shopforge-checkout-draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.name) setShippingName(parsed.name);
        if (parsed.phone) setShippingPhone(parsed.phone);
        if (parsed.address) setShippingAddress(parsed.address);
        if (parsed.note) setNote(parsed.note);
      }
    } catch (e) {}
  }, []);

  // Save draft to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('shopforge-checkout-draft', JSON.stringify({
      name: shippingName,
      phone: shippingPhone,
      address: shippingAddress,
      note: note,
    }));
  }, [shippingName, shippingPhone, shippingAddress, note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.items.length === 0) return;

    if (!user || !token) {
      router.push('/login?redirect=/checkout');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await ordersApi.create(token, {
        items: state.items.map((item) => ({
          sku_id: item.skuId,
          quantity: item.quantity,
        })),
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        note: note || undefined,
      });

      sessionStorage.removeItem('shopforge-checkout-draft');
      dispatch({ type: 'CLEAR' });
      router.push('/orders');
    } catch (err: any) {
      if (err?.status === 401) {
        router.push('/login?redirect=/checkout');
      } else {
        setError(err?.data?.detail || err?.message || '下单失败，请重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 认证加载中
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-pulse bg-gray-100 rounded-2xl h-32" />
      </div>
    );
  }

  // 未登录重定向
  if (!user || !token) {
    router.push('/login?redirect=/checkout');
    return null;
  }

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">购物车为空</h1>
        <p className="mt-2 text-gray-500">请先添加商品到购物车</p>
        <Link href="/products" className="inline-flex items-center mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors">
          去选购
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">结算</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">收货信息</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">收货人 *</label>
                  <input
                    type="text"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="请输入收货人姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号 *</label>
                  <input
                    type="tel"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="请输入手机号"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">收货地址 *</label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="请输入详细地址"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="选填"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">订单摘要</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {state.items.map((item) => (
                  <div key={item.skuId} className="flex gap-3">
                    <div className="relative w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.skuName} × {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>商品 ({totalItems} 件)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>运费</span>
                  <span className="text-green-600">免运费</span>
                </div>
                <div className="flex justify-between text-lg font-semibold mt-3 pt-3 border-t border-gray-200">
                  <span>合计</span>
                  <span className="text-indigo-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full mt-6 py-4 font-semibold rounded-full transition-colors ${
                  submitting
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {submitting ? '提交中...' : '提交订单'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

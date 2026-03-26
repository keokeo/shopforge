'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api';
import { formatPrice, ORDER_STATUS_MAP } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
  id: number;
  sku_id: number;
  product_name: string;
  sku_name?: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  order_no: string;
  status: string;
  total_amount: number;
  shipping_name?: string;
  shipping_address?: string;
  created_at: string;
  items: OrderItem[];
}

const statusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-cyan-100 text-cyan-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      router.push('/login?redirect=/orders');
      return;
    }

    ordersApi.list(token)
      .then((data: any) => setOrders(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authLoading, user, token, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">我的订单</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">我的订单</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-gray-500">暂无订单</h2>
          <p className="mt-2 text-gray-400">下单后可在此处查看订单状态</p>
          <Link href="/products" className="inline-flex items-center mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors">
            去选购
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-sm transition-shadow">
              {/* Order header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-500">#{order.order_no}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColorMap[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {ORDER_STATUS_MAP[order.status] || order.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleString('zh-CN')}
                </span>
              </div>

              {/* Order items */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <span className="text-gray-900">{item.product_name}</span>
                      {item.sku_name && (
                        <span className="text-gray-500 ml-2">({item.sku_name})</span>
                      )}
                      <span className="text-gray-400 ml-2">× {item.quantity}</span>
                    </div>
                    <span className="text-gray-700 font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Order footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  共 {order.items.reduce((sum, i) => sum + i.quantity, 0)} 件商品
                </span>
                <div className="text-right">
                  <span className="text-sm text-gray-500 mr-2">合计</span>
                  <span className="text-lg font-bold text-indigo-600">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

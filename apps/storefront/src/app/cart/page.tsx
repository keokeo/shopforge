'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { state, dispatch, totalItems, totalPrice } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">购物车</h1>
        <div className="text-center py-20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <h2 className="mt-4 text-xl font-medium text-gray-500">购物车是空的</h2>
          <p className="mt-2 text-gray-400">快去挑选心仪的商品吧</p>
          <Link href="/products" className="inline-flex items-center mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors">
            去逛逛
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">购物车 ({totalItems})</h1>
        <button
          onClick={() => dispatch({ type: 'CLEAR' })}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          清空购物车
        </button>
      </div>

      <div className="space-y-4">
        {state.items.map((item) => (
          <div key={item.skuId} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-shadow">
            {/* Image */}
            <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.productId}`} className="font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                {item.productName}
              </Link>
              <p className="text-sm text-gray-500 mt-1">{item.skuName}</p>
              <p className="text-indigo-600 font-bold mt-1">{formatPrice(item.price)}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (item.quantity <= 1) {
                    dispatch({ type: 'REMOVE_ITEM', payload: item.skuId });
                  } else {
                    dispatch({ type: 'UPDATE_QUANTITY', payload: { skuId: item.skuId, quantity: item.quantity - 1 } });
                  }
                }}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-sm"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { skuId: item.skuId, quantity: item.quantity + 1 } })}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-sm"
              >
                +
              </button>
            </div>

            {/* Subtotal & Remove */}
            <div className="flex flex-col items-end justify-between">
              <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
              <button
                onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.skuId })}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-gray-50 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">商品总计 ({totalItems} 件)</span>
          <span className="text-2xl font-bold text-indigo-600">{formatPrice(totalPrice)}</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full py-4 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors text-center"
        >
          去结算
        </Link>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { state, dispatch, totalItems, totalPrice } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-32 flex flex-col items-center border-b border-stone-200">
        <ShoppingBag strokeWidth={1} className="w-16 h-16 text-stone-200 mb-8" />
        <h1 className="text-3xl font-serif text-ink mb-4 text-center">Your Bag is Empty</h1>
        <p className="text-sm font-light text-stone-500 mb-10">Discover exceptional pieces to elevate your collection.</p>
        <Link href="/products" className="text-xs uppercase tracking-widest px-8 py-4 bg-ink text-paper hover:bg-stone-900 transition-colors border border-ink">
          View Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-16 pb-32">
      <div className="flex items-end justify-between mb-12 border-b border-ink pb-6">
        <h1 className="text-4xl font-serif text-ink tracking-tight">Shopping Bag</h1>
        <button
          onClick={() => dispatch({ type: 'CLEAR' })}
          className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-ink transition-colors pb-1 border-b border-transparent hover:border-ink"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Cart Items */}
        <div className="lg:col-span-8">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 text-[10px] uppercase tracking-widest text-stone-400 pb-4 border-b border-stone-200">
            <div className="col-span-6">Item</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <motion.div layout className="divide-y divide-stone-200">
            <AnimatePresence initial={false}>
              {state.items.map((item) => (
                <motion.div 
                  key={item.skuId}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  {/* Item Detail */}
                  <div className="md:col-span-6 flex gap-6 items-start">
                    <div className="relative w-24 aspect-[3/4] bg-stone-50 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-200">
                          <ShoppingBag strokeWidth={1} className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col h-full pt-1">
                      <Link href={`/products/${item.productId}`} className="text-lg font-serif text-ink hover:text-stone-500 transition-colors">
                        {item.productName}
                      </Link>
                      <p className="text-xs uppercase tracking-widest text-stone-400 mt-2">{item.skuName}</p>
                      <p className="text-sm font-light text-ink mt-auto pt-4">{formatPrice(item.price)}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-3 flex md:justify-center items-center mt-4 md:mt-0">
                    <div className="flex items-center border border-stone-200">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            dispatch({ type: 'REMOVE_ITEM', payload: item.skuId });
                          } else {
                            dispatch({ type: 'UPDATE_QUANTITY', payload: { skuId: item.skuId, quantity: item.quantity - 1 } });
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-ink hover:bg-stone-50 transition-colors"
                      >
                        <Minus strokeWidth={1.5} className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium text-ink">{item.quantity}</span>
                      <button
                        onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { skuId: item.skuId, quantity: item.quantity + 1 } })}
                        className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-ink hover:bg-stone-50 transition-colors"
                      >
                        <Plus strokeWidth={1.5} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal & Remove */}
                  <div className="md:col-span-3 flex md:flex-col justify-between items-center md:items-end h-full">
                    <div className="text-sm font-light text-ink md:mb-auto md:pt-1">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.skuId })}
                      className="text-stone-400 hover:text-ink transition-colors p-2 -mr-2"
                      title="Remove Item"
                    >
                      <Trash2 strokeWidth={1} className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div className="bg-stone-50 p-8 border border-stone-200 sticky top-32">
            <h2 className="text-xl font-serif text-ink tracking-tight mb-8">Summary</h2>
            
            <div className="space-y-4 text-sm font-light text-stone-600 border-b border-stone-200 pb-6 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-xs uppercase tracking-widest">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-sm uppercase tracking-widest text-ink">Total</span>
              <span className="text-2xl font-light text-ink">{formatPrice(totalPrice)}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full py-4 bg-ink text-paper text-xs text-center font-semibold uppercase tracking-[0.2em] border border-ink hover:bg-stone-900 transition-colors"
            >
              Secure Checkout
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

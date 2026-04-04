import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink text-stone-400 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <span className="font-serif text-3xl font-medium text-paper tracking-tight">
              ShopForge.
            </span>
            <p className="mt-6 max-w-sm text-sm font-light leading-relaxed">
              Curating global artifacts for the modern connoisseur. An uncompromised standard of exceptional quality.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-paper mb-6 font-semibold">快速链接</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/products" className="hover:text-paper transition-colors">全部商品</Link></li>
              <li><Link href="/cart" className="hover:text-paper transition-colors">购物车</Link></li>
              <li><Link href="/orders" className="hover:text-paper transition-colors">我的订单</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-paper mb-6 font-semibold">帮助中心</h3>
            <ul className="space-y-4 text-sm">
              <li><span className="hover:text-paper transition-colors cursor-pointer">关于我们</span></li>
              <li><span className="hover:text-paper transition-colors cursor-pointer">联系客服</span></li>
              <li><span className="hover:text-paper transition-colors cursor-pointer">退换政策</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center text-xs uppercase tracking-widest text-stone-500">
          <div>© {new Date().getFullYear()} ShopForge.</div>
          <div className="mt-4 md:mt-0">All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}

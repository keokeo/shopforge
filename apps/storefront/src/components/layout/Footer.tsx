import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ShopForge
            </span>
            <p className="mt-3 text-gray-400 max-w-md">
              现代化电商独立站，为您提供优质产品与极致购物体验。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="hover:text-white transition-colors">全部商品</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">购物车</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">我的订单</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-semibold mb-4">帮助中心</h3>
            <ul className="space-y-2">
              <li><span className="hover:text-white transition-colors cursor-pointer">关于我们</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">联系客服</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">退换政策</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} ShopForge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

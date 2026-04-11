'use client';

import { useState, useEffect } from 'react';
import { productsApi, categoriesApi } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  slug: string;
  main_image_url?: string;
  base_price: number;
  is_active: boolean;
  is_featured: boolean;
  category_id?: number;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PaginatedResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data: PaginatedResponse = await productsApi.list({
        page,
        page_size: 12,
        category_id: selectedCategory,
        search: search || undefined,
      });
      setProducts(data.items);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8 border-b border-ink pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-tight">The Catalog</h1>
          {total > 0 && (
            <p className="mt-4 text-xs uppercase tracking-widest text-stone-500">
              {total} Selected Artifacts
            </p>
          )}
        </div>
        <form onSubmit={handleSearch} className="flex items-center w-full md:w-auto relative group">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="DISCOVER..."
            className="w-full md:w-64 px-4 py-3 bg-transparent border-b border-stone-200 text-xs tracking-widest uppercase font-semibold text-ink focus:outline-none focus:border-ink transition-colors placeholder:text-stone-300"
          />
          <button
            type="submit"
            className="absolute right-0 text-xs font-bold tracking-[0.2em] uppercase text-stone-400 hover:text-ink transition-colors py-3"
          >
            →
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Sidebar Filters */}
        <div className="lg:w-48 flex-shrink-0">
          <h3 className="text-xs uppercase tracking-[0.2em] text-ink font-semibold mb-8">Refine</h3>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => { setSelectedCategory(undefined); setPage(1); }}
                className={`text-xs uppercase tracking-widest transition-colors ${
                  !selectedCategory ? 'text-ink font-semibold' : 'text-stone-400 hover:text-ink'
                }`}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                  className={`text-xs uppercase tracking-widest transition-colors ${
                    selectedCategory === cat.id ? 'text-ink font-semibold' : 'text-stone-400 hover:text-ink'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-stone-100 mb-4" />
                  <div className="mx-auto h-4 bg-stone-100 w-1/2 mb-2" />
                  <div className="mx-auto h-3 bg-stone-100 w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  mainImageUrl={product.main_image_url}
                  basePrice={product.base_price}
                  isFeatured={product.is_featured}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 border border-stone-200 bg-stone-50">
              <h2 className="font-serif text-2xl text-ink mb-2">No Artifacts Found</h2>
              <p className="text-sm font-light text-stone-500">The requested collection is currently empty.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-24 pt-8 border-t border-stone-200 text-xs uppercase tracking-widest">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="text-stone-400 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Previous
              </button>
              <span className="text-ink">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="text-stone-400 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

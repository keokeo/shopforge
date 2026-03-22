'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { productsApi, skusApi } from '@/lib/api';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description?: string;
  main_image_url?: string;
  base_price: number;
  is_active: boolean;
  is_featured: boolean;
  images: { id: number; image_url: string; alt_text?: string; sort_order: number }[];
  category?: { id: number; name: string; slug: string };
}

interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  sort_order: number;
}

interface ProductAttribute {
  id: number;
  product_id: number;
  name: string;
  sort_order: number;
  values: AttributeValue[];
}

interface SKU {
  id: number;
  product_id: number;
  sku_code: string;
  price: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  attribute_values: AttributeValue[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);
  const { dispatch } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([
      productsApi.get(productId),
      skusApi.getAttributes(productId),
      skusApi.list(productId),
    ])
      .then(([prod, attrs, skuList]) => {
        setProduct(prod);
        setAttributes(attrs);
        setSkus(skuList);
        // Auto-select first value for each attribute
        const defaultSelections: Record<number, number> = {};
        attrs.forEach((attr: ProductAttribute) => {
          if (attr.values.length > 0) {
            defaultSelections[attr.id] = attr.values[0].id;
          }
        });
        setSelectedValues(defaultSelections);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  // Find matching SKU based on selected attribute values
  const matchedSku = useMemo(() => {
    if (skus.length === 0) return null;
    const selectedIds = Object.values(selectedValues).sort();
    if (selectedIds.length === 0 && skus.length > 0) return skus[0];

    return skus.find((sku) => {
      const skuValueIds = sku.attribute_values.map((v) => v.id).sort();
      if (skuValueIds.length !== selectedIds.length) return false;
      return skuValueIds.every((id, i) => id === selectedIds[i]);
    }) || null;
  }, [skus, selectedValues]);

  const displayPrice = matchedSku ? matchedSku.price : product?.base_price || 0;
  const stock = matchedSku ? matchedSku.stock : 0;
  const allImages = product
    ? [
        ...(product.main_image_url ? [{ url: product.main_image_url, alt: product.name }] : []),
        ...product.images.map((img) => ({ url: img.image_url, alt: img.alt_text || product.name })),
      ]
    : [];

  const handleAddToCart = () => {
    if (!product || !matchedSku || matchedSku.stock < quantity) return;

    const attrDesc = matchedSku.attribute_values.map((v) => v.value).join(', ');

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        skuId: matchedSku.id,
        productId: product.id,
        productName: product.name,
        skuName: attrDesc || matchedSku.sku_code,
        price: matchedSku.price,
        quantity,
        imageUrl: matchedSku.image_url || product.main_image_url,
      },
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">商品不存在</h1>
        <Link href="/products" className="mt-4 inline-block text-indigo-600 hover:underline">
          返回商品列表
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-indigo-600 transition-colors">首页</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-indigo-600 transition-colors">全部商品</Link>
        {product.category && (
          <>
            <span>/</span>
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">{product.category.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
            {allImages.length > 0 ? (
              <Image
                src={allImages[currentImageIndex].url}
                alt={allImages[currentImageIndex].alt}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    i === currentImageIndex ? 'border-indigo-600' : 'border-transparent'
                  }`}
                >
                  <Image src={img.url} alt={img.alt} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.is_featured && (
            <span className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
              精选推荐
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {product.category && (
            <p className="mt-2 text-sm text-gray-500">{product.category.name}</p>
          )}

          <div className="mt-6">
            <span className="text-3xl font-bold text-indigo-600">{formatPrice(displayPrice)}</span>
            {matchedSku && (
              <span className={`ml-3 text-sm ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {stock > 0 ? `库存 ${stock} 件` : '暂时缺货'}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* SKU Selector */}
          {attributes.length > 0 && (
            <div className="mt-8 space-y-6">
              {attributes.map((attr) => (
                <div key={attr.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{attr.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((val) => (
                      <button
                        key={val.id}
                        onClick={() => setSelectedValues((prev) => ({ ...prev, [attr.id]: val.id }))}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedValues[attr.id] === val.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {val.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <span className="w-12 text-center text-lg font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(stock || 99, quantity + 1))}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!matchedSku || stock < 1}
              className={`flex-1 py-4 font-semibold rounded-full transition-all ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : !matchedSku || stock < 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {addedToCart ? '✓ 已加入购物车' : !matchedSku ? '请选择规格' : stock < 1 ? '暂时缺货' : '加入购物车'}
            </button>
            <Link
              href="/cart"
              className="px-6 py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-full hover:bg-indigo-50 transition-colors text-center"
            >
              查看购物车
            </Link>
          </div>

          {/* SKU Info */}
          {matchedSku && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">
                SKU: <span className="text-gray-700">{matchedSku.sku_code}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

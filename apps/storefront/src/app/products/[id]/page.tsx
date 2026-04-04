'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi, skusApi } from '@/lib/api';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

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

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

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
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const handleLightboxKey = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight')
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      if (e.key === 'ArrowLeft')
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    },
    [lightboxOpen, allImages.length]
  );

  useEffect(() => {
    if (lightboxOpen) {
      document.addEventListener('keydown', handleLightboxKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleLightboxKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, handleLightboxKey]);

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
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-pulse">
          <div className="aspect-[3/4] bg-stone-100" />
          <div className="space-y-6 pt-12">
            <div className="h-10 bg-stone-100 w-3/4" />
            <div className="h-6 bg-stone-100 w-1/4" />
            <div className="h-32 bg-stone-100 mt-12" />
            <div className="h-16 bg-stone-100 w-full mt-12" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif text-ink mb-6">Object Not Found</h1>
        <Link href="/products" className="text-xs uppercase tracking-widest text-stone-500 hover:text-ink transition-colors pb-1 border-b border-stone-500 hover:border-ink">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 pb-32">
      {/* Breadcrumb */}
      <motion.nav 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-stone-400 mb-12"
      >
        <Link href="/" className="hover:text-ink transition-colors">Home</Link>
        <span className="text-stone-300">/</span>
        <Link href="/products" className="hover:text-ink transition-colors">Catalog</Link>
        {product.category && (
          <>
            <span className="text-stone-300">/</span>
            <span className="hover:text-ink transition-colors cursor-pointer">{product.category.name}</span>
          </>
        )}
      </motion.nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
        {/* Left Column: Image Gallery */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="md:sticky md:top-28 self-start">
          <div
            className="aspect-[3/4] bg-stone-50 relative cursor-zoom-in group"
            onClick={() => allImages.length > 0 && setLightboxOpen(true)}
          >
            {allImages.length > 0 ? (
              <Image
                src={allImages[currentImageIndex].url}
                alt={allImages[currentImageIndex].alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-200">
                <ZoomIn className="w-12 h-12" strokeWidth={1} />
              </div>
            )}
            {/* Minimalist expand icon overlay */}
            {allImages.length > 0 && (
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-ink">
                <ZoomIn strokeWidth={1.5} className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="flex gap-4 mt-6 overflow-x-auto pb-4 scrollbar-hide">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`relative w-24 aspect-[3/4] flex-shrink-0 transition-opacity duration-300 ${
                    i === currentImageIndex ? 'opacity-100 ring-1 ring-ink ring-offset-4' : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt={img.alt} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Column: Product Detail Info */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="pt-4 md:pt-12">
          
          <motion.div variants={fadeUp} className="mb-10 border-b border-stone-200 pb-10">
            {product.is_featured && (
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-4">
                Exceptional Piece
              </div>
            )}
            <h1 className="text-4xl lg:text-5xl font-serif text-ink tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="mt-6 flex items-end gap-4">
              <span className="text-2xl font-light text-ink">{formatPrice(displayPrice)}</span>
              {matchedSku && (
                <span className={`text-xs uppercase tracking-widest ${stock > 0 ? 'text-stone-400' : 'text-red-800'}`}>
                  {stock > 0 ? `IN STOCK (${stock})` : 'OUT OF STOCK'}
                </span>
              )}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            {product.description && (
              <div className="prose prose-stone text-sm text-stone-600 leading-relaxed font-light mt-8 mb-12">
                {product.description}
              </div>
            )}
          </motion.div>

          {/* SKU Selector Grid */}
          <motion.div variants={fadeUp} className="space-y-8">
            {attributes.map((attr) => (
              <div key={attr.id} className="border-t border-stone-200 pt-6">
                <label className="block text-xs uppercase tracking-[0.2em] text-ink mb-4">{attr.name}</label>
                <div className="flex flex-wrap gap-3">
                  {attr.values.map((val) => (
                    <button
                      key={val.id}
                      onClick={() => setSelectedValues((prev) => ({ ...prev, [attr.id]: val.id }))}
                      className={`px-6 py-3 text-xs uppercase tracking-widest transition-all duration-300 ${
                        selectedValues[attr.id] === val.id
                          ? 'bg-ink text-paper border border-ink'
                          : 'bg-transparent text-stone-500 border border-stone-200 hover:border-ink hover:text-ink'
                      }`}
                    >
                      {val.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Quantity & Actions */}
          <motion.div variants={fadeUp} className="mt-12 pt-8 border-t border-stone-200">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Quantity */}
              <div className="flex items-center border border-stone-200 self-start">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-14 flex items-center justify-center text-stone-400 hover:text-ink hover:bg-stone-50 transition-colors"
                >
                  <span className="text-lg font-light">−</span>
                </button>
                <span className="w-12 text-center text-sm font-medium text-ink">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stock || 99, quantity + 1))}
                  className="w-12 h-14 flex items-center justify-center text-stone-400 hover:text-ink hover:bg-stone-50 transition-colors"
                >
                  <span className="text-lg font-light">+</span>
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!matchedSku || stock < 1}
                className={`flex-1 h-14 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-500 ${
                  addedToCart
                    ? 'bg-stone-200 text-ink border border-stone-200'
                    : !matchedSku || stock < 1
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-100'
                    : 'bg-ink text-paper hover:bg-stone-900 border border-ink'
                }`}
              >
                {addedToCart ? 'Added to bag' : !matchedSku ? 'Select Specification' : stock < 1 ? 'Unavailable' : 'Add to bag'}
              </button>
            </div>
            {matchedSku && (
              <p className="mt-6 text-[10px] uppercase tracking-widest text-stone-400">
                Item No. {matchedSku.sku_code}
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Fullscreen Lightbox Overlay */}
      <AnimatePresence>
        {lightboxOpen && allImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-paper/95 backdrop-blur-xl"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close */}
            <button
              className="absolute top-8 right-8 text-ink p-2 hover:opacity-50 transition-opacity"
              onClick={() => setLightboxOpen(false)}
            >
              <X strokeWidth={1} className="w-10 h-10" />
            </button>

            {/* Counter */}
            <div className="absolute top-10 left-10 text-ink text-xs tracking-widest">
              {currentImageIndex + 1} / {allImages.length}
            </div>

            {/* Nav Prev */}
            {allImages.length > 1 && (
              <button
                className="absolute left-6 md:left-12 text-stone-400 hover:text-ink p-4 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                }}
              >
                <ChevronLeft strokeWidth={1} className="w-12 h-12" />
              </button>
            )}

            {/* Main Lightbox Image */}
            <div
              className="relative w-[85vw] h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[currentImageIndex].url}
                alt={allImages[currentImageIndex].alt}
                fill
                className="object-contain"
                sizes="85vw"
                priority
              />
            </div>

            {/* Nav Next */}
            {allImages.length > 1 && (
              <button
                className="absolute right-6 md:right-12 text-stone-400 hover:text-ink p-4 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
                }}
              >
                <ChevronRight strokeWidth={1} className="w-12 h-12" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

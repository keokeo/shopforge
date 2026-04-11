import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  id: number;
  name: string;
  mainImageUrl?: string;
  basePrice: number;
  isFeatured?: boolean;
}

export default function ProductCard({ id, name, mainImageUrl, basePrice, isFeatured }: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="relative overflow-hidden bg-stone-50 aspect-[3/4] mb-4">
        {mainImageUrl ? (
          <Image
            src={mainImageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-200">
            <ShoppingBag strokeWidth={1} className="w-8 h-8" />
          </div>
        )}
        {isFeatured && (
          <span className="absolute top-4 left-4 bg-ink text-paper text-[10px] uppercase tracking-[0.2em] px-3 py-1">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-col items-center text-center">
        <h3 className="font-serif text-lg text-ink mb-1 group-hover:text-stone-500 transition-colors">
          {name}
        </h3>
        <p className="text-sm font-light text-stone-600">
          {formatPrice(basePrice)}
        </p>
      </div>
    </Link>
  );
}

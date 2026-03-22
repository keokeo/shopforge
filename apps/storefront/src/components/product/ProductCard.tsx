import Link from 'next/link';
import Image from 'next/image';

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
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square">
        {mainImageUrl ? (
          <Image
            src={mainImageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        )}
        {isFeatured && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            精选
          </span>
        )}
      </div>
      <div className="mt-3 px-1">
        <h3 className="text-gray-900 font-medium group-hover:text-indigo-600 transition-colors line-clamp-2">
          {name}
        </h3>
        <p className="mt-1 text-lg font-bold text-indigo-600">
          ¥{basePrice.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

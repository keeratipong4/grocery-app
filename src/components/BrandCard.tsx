import type { Brand } from '@/types';
import Link from 'next/link';

interface Props {
  brand: Brand;
}

const BRAND_MAP: Record<string, string> = {
  '1': '/category/vegetables', // GreenFarm -> vegetables
  '2': '/category/fruits',     // SunHarvest -> fruits
  '3': '/category/beverage',   // PureLife -> beverage
  '4': '/category/dairy',      // DairyBest -> dairy
};

export default function BrandCard({ brand }: Props) {
  const href = BRAND_MAP[brand.id] || `/search?q=${encodeURIComponent(brand.name)}`;

  return (
    <Link
      href={href}
      className="bg-white border border-border rounded-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 block"
    >
      <div className={`aspect-[4/3] bg-gradient-to-br ${brand.gradient} flex items-center justify-center`}>
        <span className="text-xl font-bold text-gray-800">
          {brand.logo} {brand.name}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900">{brand.name}</h3>
        <p className="text-xs text-text-secondary mt-0.5">{brand.subtitle}</p>
      </div>
    </Link>
  );
}

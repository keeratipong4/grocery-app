import type { Brand } from '@/types';

interface Props {
  brand: Brand;
}

export default function BrandCard({ brand }: Props) {
  return (
    <a
      href="#"
      className="bg-white border border-border rounded-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-1"
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
    </a>
  );
}

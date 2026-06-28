import type { Category } from '@/types';

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
  return (
    <a
      href={`/category/${category.slug}`}
      className="flex flex-col items-center gap-2 p-4 bg-white border border-border rounded-banner min-h-[120px] justify-center transition-all hover:border-primary hover:shadow-card hover:-translate-y-0.5"
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
        style={{ background: category.color }}
      >
        {category.icon}
      </div>
      <span className="text-sm font-medium text-gray-800 text-center">{category.name}</span>
    </a>
  );
}

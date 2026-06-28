import { notFound } from 'next/navigation';
import Link from 'next/link';
import { categories } from '@/data/categories';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return categories.map(cat => ({ slug: cat.slug }));
}

export function generateMetadata({ params }: Props) {
  const category = categories.find(c => c.slug === params.slug);
  if (!category) return {};
  return { title: `${category.name} | Farmart` };
}

export default function CategoryPage({ params }: Props) {
  const category = categories.find(c => c.slug === params.slug);
  if (!category) notFound();

  const categoryProducts = products.filter(p => p.category === category.name);
  const otherCategories = categories.filter(c => c.slug !== params.slug);

  return (
    <>
      {/* Breadcrumb + Category Hero */}
      <section className="py-8 bg-surface border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6">
          <nav aria-label="breadcrumb" className="text-sm text-text-secondary mb-4">
            <Link href="/" className="hover:text-primary transition-colors">หน้าแรก</Link>
            <span className="mx-2">/</span>
            <span className="text-ink font-medium">{category.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: category.color }}
            >
              {category.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-sm text-text-secondary mt-1">
                {categoryProducts.length} สินค้า
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader title={`สินค้าใน${category.name}`} />

          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {categoryProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-5xl mb-4">{category.icon}</p>
              <p className="text-lg font-semibold text-gray-800">
                ยังไม่มีสินค้าในหมวดนี้
              </p>
              <p className="text-sm text-text-secondary mt-2">
                กำลังเพิ่มสินค้าใหม่เร็วๆ นี้
              </p>
              <Link
                href="/"
                className="inline-block mt-6 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-md transition-colors text-sm"
              >
                กลับหน้าแรก
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Other Categories */}
      <section className="py-16 bg-muted">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader title="หมวดหมู่อื่นๆ" />
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {otherCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-border rounded-banner min-h-[100px] justify-center transition-all hover:border-primary hover:shadow-card hover:-translate-y-0.5"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: cat.color }}
                >
                  {cat.icon}
                </div>
                <span className="text-xs font-medium text-gray-800 text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

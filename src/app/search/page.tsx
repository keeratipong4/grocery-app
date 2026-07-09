import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import SearchControlsClient from '@/components/SearchControlsClient';
import { calcDiscountedPrice } from '@/lib/utils';
import Link from 'next/link';
import type { Product } from '@/types';

interface Props {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
    isNew?: string;
    hasDiscount?: string;
    page?: string;
  };
}

export const metadata = {
  title: 'ค้นหาสินค้า | Farmart',
  description: 'ค้นหาผักสด ผลไม้ นม ไข่ เนื้อสัตว์ และสินค้าอื่นๆ ในร้าน Farmart',
};

export default async function SearchPage({ searchParams }: Props) {
  // 1. Fetch categories for the sidebar selection
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  // 2. Parse search parameters
  const q = searchParams.q || '';
  const categorySlug = searchParams.category || '';
  const sort = searchParams.sort || 'newest';
  const isNewOnly = searchParams.isNew === 'true';
  const hasDiscount = searchParams.hasDiscount === 'true';
  const page = Math.max(1, Number(searchParams.page || '1'));
  const limit = 16; // 16 items per page (fits 2, 3, or 4 columns grid nicely)

  // 3. Find Category ID if category filter is active
  let activeCategory = null;
  if (categorySlug) {
    activeCategory = categories.find(c => c.slug === categorySlug) || null;
  }

  // 4. Fetch Products matching criteria
  const dbProducts = await prisma.product.findMany({
    where: {
      ...(activeCategory ? { categoryId: activeCategory.id } : {}),
      ...(isNewOnly ? { isNew: true } : {}),
      ...(hasDiscount ? { discount: { gt: 0 } } : {}),
    },
    include: { category: true },
  });

  // 5. Map products to the frontend Product interface
  let filteredProducts = dbProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    price: p.price,
    discount: p.discount,
    image: p.image,
    rating: p.rating,
    reviewCount: p.reviewCount,
    isNew: p.isNew,
  }));

  // 6. Apply text filter (if q is provided)
  if (q) {
    const lower = q.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower)
    );
  }

  // 7. Apply Sorting
  const sortFns: Record<string, (a: Product, b: Product) => number> = {
    price_asc:     (a, b) => calcDiscountedPrice(a.price, a.discount) - calcDiscountedPrice(b.price, b.discount),
    price_desc:    (a, b) => calcDiscountedPrice(b.price, b.discount) - calcDiscountedPrice(a.price, a.discount),
    rating_desc:   (a, b) => b.rating - a.rating,
    discount_desc: (a, b) => b.discount - a.discount,
    newest:        (a, b) => Number(b.isNew) - Number(a.isNew),
  };
  if (sortFns[sort]) {
    filteredProducts.sort(sortFns[sort]);
  }

  // 8. Pagination slice
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);

  // Helper to build page link
  function getPageLink(pageNum: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val && key !== 'page') params.set(key, val);
    });
    params.set('page', String(pageNum));
    return `/search?${params.toString()}`;
  }

  // Helper to build category filter link
  function getCategoryFilterLink(slug: string | null) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val && key !== 'category' && key !== 'page') params.set(key, val);
    });
    if (slug) params.set('category', slug);
    return `/search?${params.toString()}`;
  }

  return (
    <main className="min-h-screen bg-surface py-12">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">หน้าแรก</Link>
          <span className="mx-2">/</span>
          <span className="text-ink font-medium">
            {activeCategory ? `ค้นหาใน "${activeCategory.name}"` : 'ค้นหาสินค้า'}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Left Column: Sidebar Filters */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            <SearchControlsClient />

            {/* Category selection */}
            <div className="bg-white border border-border rounded-banner p-5 shadow-card">
              <h3 className="font-bold text-gray-900 mb-4 border-b border-border pb-3">หมวดหมู่สินค้า</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={getCategoryFilterLink(null)}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${!categorySlug ? 'bg-primary text-white font-semibold' : 'text-gray-700 hover:bg-surface'}`}
                  >
                    ทุกหมวดหมู่ ({total})
                  </Link>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link
                      href={getCategoryFilterLink(cat.slug)}
                      className={`block px-3 py-2 text-sm rounded-md transition-colors ${categorySlug === cat.slug ? 'bg-primary text-white font-semibold' : 'text-gray-700 hover:bg-surface'}`}
                    >
                      {cat.icon} <span className="ml-1.5">{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Column: Results Grid */}
          <div>
            <div className="bg-white border border-border rounded-banner p-6 shadow-card mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {q ? `ผลการค้นหาสำหรับ "${q}"` : 'สินค้าทั้งหมด'}
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  พบทั้งหมด {total} รายการ
                </p>
              </div>
            </div>

            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {paginatedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    {page > 1 && (
                      <Link
                        href={getPageLink(page - 1)}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-border rounded-md hover:bg-surface transition-colors"
                      >
                        ‹ ย้อนกลับ
                      </Link>
                    )}

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <Link
                          key={pageNum}
                          href={getPageLink(pageNum)}
                          className={`w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-md transition-colors ${page === pageNum ? 'bg-primary text-white' : 'bg-white border border-border text-gray-700 hover:bg-surface'}`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}

                    {page < totalPages && (
                      <Link
                        href={getPageLink(page + 1)}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-border rounded-md hover:bg-surface transition-colors"
                      >
                        ถัดไป ›
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-border rounded-banner p-16 text-center shadow-card">
                <span className="text-5xl block mb-4" role="img" aria-label="no-results">🔍</span>
                <h2 className="text-lg font-bold text-gray-800 mb-2">ไม่พบสินค้าที่ต้องการ</h2>
                <p className="text-sm text-text-secondary max-w-md mx-auto">
                  ขออภัย ไม่พบสินค้าที่ตรงกับคำค้นหาหรือตัวกรองของคุณ กรุณาลองใช้คำค้นหาใหม่หรือปรับเปลี่ยนการตั้งค่าตัวกรองในแถบด้านข้าง
                </p>
                <Link
                  href="/search"
                  className="inline-block mt-6 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-2.5 rounded-md transition-colors"
                >
                  ดูสินค้าทั้งหมด
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

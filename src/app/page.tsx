import HeroBanner from '@/components/HeroBanner';
import CategoryCard from '@/components/CategoryCard';
import BrandCard from '@/components/BrandCard';
import ProductCard from '@/components/ProductCard';
import ProductRow from '@/components/ProductRow';
import MembershipPanel from '@/components/MembershipPanel';
import SectionHeader from '@/components/SectionHeader';
import { categories, brands } from '@/data/categories';
import { topSaverProducts, bestSellerProducts, justLandingProducts } from '@/data/products';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <HeroBanner />

      {/* Browse By Category */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader title="เลือกซื้อตามหมวดหมู่" href="/search" />
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {categories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-16 bg-muted">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader title="แบรนด์แนะนำ" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brands.map(brand => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </section>

      {/* Top Saver Today */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader title="สินค้าราคาพิเศษวันนี้" href="/search?hasDiscount=true" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              {topSaverProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i === 0} />
              ))}
            </div>
            <MembershipPanel />
          </div>
        </div>
      </section>

      {/* Best Seller */}
      <section className="py-16 bg-muted">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader title="สินค้าขายดี" href="/search?sort=rating_desc" />
          <ProductRow products={bestSellerProducts} />
        </div>
      </section>

      {/* Just Landing */}
      <section className="py-16 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <SectionHeader title="สินค้าใหม่มาใหม่" href="/search?isNew=true" />
          <ProductRow products={justLandingProducts} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-[1280px] mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">F</span>
              <span className="text-xl font-bold text-white">farmart</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-[200px]">
              พันธมิตรร้านขายของชำออนไลน์ที่คุณไว้ใจได้ สินค้าสดใหม่ส่งถึงบ้านทุกวัน
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">บริษัท</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { label: 'เกี่ยวกับเรา', href: '/about' },
                { label: 'ร่วมงานกับเรา', href: '/careers' },
                { label: 'ข่าวสาร', href: '/news' },
                { label: 'บล็อก', href: '/blog' }
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">ช่วยเหลือ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { label: 'ศูนย์ช่วยเหลือ', href: '/help' },
                { label: 'ติดตามออเดอร์', href: '/orders' },
                { label: 'คืนสินค้า', href: '/returns' },
                { label: 'ติดต่อเรา', href: '/contact' }
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">ช้อปปิ้ง</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { label: 'ผัก', href: '/category/vegetables' },
                { label: 'ผลไม้', href: '/category/fruits' },
                { label: 'นม & ไข่', href: '/category/dairy' },
                { label: 'เนื้อสัตว์ & อาหารทะเล', href: '/category/meat' }
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 px-6">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
            <p>© 2025 Farmart. สงวนลิขสิทธิ์</p>
            <div className="flex gap-2">
              {['VISA', 'MC', 'PayPal', 'PromptPay'].map(p => (
                <span key={p} className="bg-white/10 text-gray-300 text-xs font-bold px-2 py-1 rounded">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, calcDiscountedPrice } from '@/lib/utils';
import AddToCartButton from '@/components/AddToCartButton';
import ProductRow from '@/components/ProductRow';
import SectionHeader from '@/components/SectionHeader';
import DiscountBadge from '@/components/DiscountBadge';
import NewBadge from '@/components/NewBadge';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });
  if (!product) return {};
  return { title: `${product.name} | Farmart` };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  const relatedDbProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { category: true },
    take: 8,
  });

  const mappedProduct = {
    id: product.id,
    name: product.name,
    category: product.category.name,
    price: product.price,
    discount: product.discount,
    image: product.image,
    rating: product.rating,
    reviewCount: product.reviewCount,
    isNew: product.isNew,
  };

  const mappedRelatedProducts = relatedDbProducts.map(p => ({
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

  const finalPrice = calcDiscountedPrice(product.price, product.discount);

  return (
    <main className="min-h-screen bg-surface py-12">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="text-sm text-text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">หน้าแรก</Link>
          <span className="mx-2">/</span>
          <Link href={`/category/${product.category.slug}`} className="hover:text-primary transition-colors">
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink font-medium">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="bg-white border border-border rounded-banner shadow-card p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Left Column: Image */}
          <div className="relative aspect-[4/3] w-full rounded-banner overflow-hidden bg-surface border border-border">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-w-md) 100vw, 600px"
              className="object-cover"
            />
            {/* Absolute positioning relative to the container */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <DiscountBadge discount={product.discount} />
              <NewBadge isNew={product.isNew} discount={product.discount} />
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {product.category.name}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              {/* Rating & Review */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-amber-400 text-lg">
                  {'★'.repeat(Math.floor(product.rating))}
                  {'½'.includes(String(product.rating % 1)) ? '½' : ''}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                <span className="text-xs text-text-secondary">({product.reviewCount} รีวิวจากลูกค้า)</span>
              </div>

              {/* Price section */}
              <div className="flex items-baseline gap-3 mb-6 bg-surface p-4 rounded-lg border border-border">
                <span className="text-3xl font-extrabold text-gray-900">{formatPrice(finalPrice)}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-lg text-text-secondary line-through">{formatPrice(product.price)}</span>
                    <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded">
                      ประหยัด {product.discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Features / Guarantees (Premium touch) */}
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-6 mb-8 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-success">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>รับประกันความสดใหม่</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-success">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>จัดส่งฟรีเมื่อช้อปครบ ฿500</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-border pt-6">
              <AddToCartButton product={mappedProduct} />
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {mappedRelatedProducts.length > 0 && (
          <section className="bg-white border border-border rounded-banner shadow-card p-6 md:p-8">
            <SectionHeader title="สินค้าใกล้เคียงที่คุณอาจสนใจ" />
            <ProductRow products={mappedRelatedProducts} />
          </section>
        )}
      </div>
    </main>
  );
}

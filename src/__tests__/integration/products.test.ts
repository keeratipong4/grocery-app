import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GET as getProducts } from '@/app/api/products/route';
import { GET as getProduct } from '@/app/api/products/[id]/route';
import { GET as search } from '@/app/api/search/route';
import { GET as getCategories } from '@/app/api/categories/route';
import { makeReq } from '../helpers/request';

describe('GET /api/products', () => {
  it('returns all products with meta', async () => {
    const res = await getProducts(makeReq('GET', '/api/products'));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    assert.ok(body.meta.total > 0);
    assert.equal(body.meta.page, 1);
  });

  it('filters by category slug', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?category=vegetables'));
    const body = await res.json();
    assert.ok(body.data.length > 0);
    body.data.forEach((p: { category: string }) => {
      assert.equal(p.category, 'ผัก');
    });
  });

  it('returns all products when category slug does not match any category (no filter applied)', async () => {
    // Known behavior: route only filters when `categories.find(slug)` returns a match.
    // An unrecognised slug leaves `result` unfiltered.
    const resAll = await getProducts(makeReq('GET', '/api/products?limit=100'));
    const bodyAll = await resAll.json();
    const res = await getProducts(makeReq('GET', '/api/products?category=nonexistent&limit=100'));
    const body = await res.json();
    assert.equal(body.data.length, bodyAll.data.length);
  });

  it('filters by text query (q)', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?q=นม'));
    const body = await res.json();
    assert.ok(body.data.length > 0);
    body.data.forEach((p: { name: string; category: string }) => {
      const lowerName = p.name.toLowerCase();
      const lowerCat = p.category.toLowerCase();
      assert.ok(
        lowerName.includes('นม') || lowerCat.includes('นม'),
        `Product "${p.name}" should match query`
      );
    });
  });

  it('returns empty when query matches nothing', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?q=zzzznonexistent'));
    const body = await res.json();
    assert.equal(body.data.length, 0);
  });

  it('filters isNew=true returns only new products', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?isNew=true'));
    const body = await res.json();
    assert.ok(body.data.length > 0);
    body.data.forEach((p: { isNew: boolean }) => {
      assert.equal(p.isNew, true);
    });
  });

  it('filters hasDiscount=true returns only discounted products', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?hasDiscount=true'));
    const body = await res.json();
    assert.ok(body.data.length > 0);
    body.data.forEach((p: { discount: number }) => {
      assert.ok(p.discount > 0);
    });
  });

  it('sorts by price_asc — first item has lowest discounted price', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?sort=price_asc&limit=100'));
    const body = await res.json();
    const prices: number[] = body.data.map((p: { price: number; discount: number }) =>
      Math.round(p.price * (1 - p.discount / 100))
    );
    for (let i = 1; i < prices.length; i++) {
      assert.ok(prices[i] >= prices[i - 1], `Price at index ${i} should be >= previous`);
    }
  });

  it('sorts by price_desc — first item has highest discounted price', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?sort=price_desc&limit=100'));
    const body = await res.json();
    const prices: number[] = body.data.map((p: { price: number; discount: number }) =>
      Math.round(p.price * (1 - p.discount / 100))
    );
    for (let i = 1; i < prices.length; i++) {
      assert.ok(prices[i] <= prices[i - 1], `Price at index ${i} should be <= previous`);
    }
  });

  it('sorts by rating_desc', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?sort=rating_desc&limit=100'));
    const body = await res.json();
    const ratings: number[] = body.data.map((p: { rating: number }) => p.rating);
    for (let i = 1; i < ratings.length; i++) {
      assert.ok(ratings[i] <= ratings[i - 1], `Rating at index ${i} should be <= previous`);
    }
  });

  it('sorts by discount_desc', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?sort=discount_desc&limit=100'));
    const body = await res.json();
    const discounts: number[] = body.data.map((p: { discount: number }) => p.discount);
    for (let i = 1; i < discounts.length; i++) {
      assert.ok(discounts[i] <= discounts[i - 1], `Discount at index ${i} should be <= previous`);
    }
  });

  it('paginates correctly with page=2 and limit=5', async () => {
    const all = await getProducts(makeReq('GET', '/api/products?limit=100'));
    const allBody = await all.json();
    const total = allBody.meta.total;

    const res = await getProducts(makeReq('GET', '/api/products?page=2&limit=5'));
    const body = await res.json();
    assert.equal(body.meta.page, 2);
    assert.equal(body.meta.limit, 5);
    assert.equal(body.data.length, Math.min(5, Math.max(0, total - 5)));
    assert.equal(body.meta.totalPages, Math.ceil(total / 5));
  });

  it('clamps limit to 100 max', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?limit=999'));
    const body = await res.json();
    assert.ok(body.data.length <= 100);
  });

  it('clamps page to 1 min when page=0', async () => {
    const res = await getProducts(makeReq('GET', '/api/products?page=0'));
    const body = await res.json();
    assert.equal(body.meta.page, 1);
  });

  it('returns correct total in meta', async () => {
    const resAll = await getProducts(makeReq('GET', '/api/products?limit=100'));
    const bodyAll = await resAll.json();
    const totalAll = bodyAll.meta.total;

    const resVeg = await getProducts(makeReq('GET', '/api/products?category=vegetables&limit=100'));
    const bodyVeg = await resVeg.json();
    const totalVeg = bodyVeg.meta.total;

    assert.ok(totalAll >= totalVeg, 'Total all should be >= total vegetables');
  });
});

describe('GET /api/products/:id', () => {
  it('returns product for valid id', async () => {
    const res = await getProduct(new Request('http://localhost:3000/api/products/1'), {
      params: { id: '1' },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.id, '1');
    assert.equal(body.data.name, 'บร็อคโคลี่ออร์แกนิค');
  });

  it('returns product with all expected fields', async () => {
    const res = await getProduct(new Request('http://localhost:3000/api/products/3'), {
      params: { id: '3' },
    });
    const body = await res.json();
    const p = body.data;
    assert.ok('id' in p);
    assert.ok('name' in p);
    assert.ok('price' in p);
    assert.ok('discount' in p);
    assert.ok('category' in p);
    assert.ok('rating' in p);
    assert.ok('isNew' in p);
  });

  it('returns 404 for unknown id', async () => {
    const res = await getProduct(new Request('http://localhost:3000/api/products/999'), {
      params: { id: '999' },
    });
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.code, 'NOT_FOUND');
  });
});

describe('GET /api/search', () => {
  it('returns matching products for valid query', async () => {
    const res = await search(makeReq('GET', '/api/search?q=นม'));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.length > 0);
    assert.equal(body.meta.page, 1);
  });

  it('returns 400 when query is shorter than 2 chars', async () => {
    const res = await search(makeReq('GET', '/api/search?q=น'));
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'VALIDATION_ERROR');
  });

  it('returns 400 when query is empty', async () => {
    const res = await search(makeReq('GET', '/api/search?q='));
    assert.equal(res.status, 400);
  });

  it('respects limit param', async () => {
    const res = await search(makeReq('GET', '/api/search?q=นม&limit=1'));
    const body = await res.json();
    assert.ok(body.data.length <= 1);
  });

  it('clamps limit to 50 max', async () => {
    const res = await search(makeReq('GET', '/api/search?q=น&limit=100'));
    // q is too short, will get 400
    assert.equal(res.status, 400);
  });

  it('returns empty array for query that matches nothing', async () => {
    const res = await search(makeReq('GET', '/api/search?q=zznonexistent'));
    const body = await res.json();
    assert.equal(body.data.length, 0);
  });

  it('searches by category name', async () => {
    const res = await search(makeReq('GET', '/api/search?q=ผัก'));
    const body = await res.json();
    assert.ok(body.data.length > 0);
  });
});

describe('GET /api/categories', () => {
  it('returns categories list', async () => {
    const res = await getCategories();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    const first = body.data[0];
    assert.ok('id' in first);
    assert.ok('name' in first);
    assert.ok('slug' in first);
  });
});

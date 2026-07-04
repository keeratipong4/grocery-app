/**
 * Integration test for /api/items — hits a real SQLite database via Prisma.
 * Uses prisma/dev.db (the singleton from src/lib/prisma.ts).
 * Each run cleans up Item records before and after to keep the DB clean.
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { GET as getItems, POST as createItemRoute } from '@/app/api/items/route';
import { getItems as getItemsService, createItem } from '@/services/itemService';
import { prisma } from '@/lib/prisma';
import { makeReq } from '../helpers/request';

before(async () => {
  await prisma.item.deleteMany();
});

after(async () => {
  await prisma.item.deleteMany();
  await prisma.$disconnect();
});

describe('GET /api/items (route → real SQLite)', () => {
  it('returns empty list when no items exist', async () => {
    const res = await getItems();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.equal(body.data.length, 0);
  });

  it('returns items after they are created', async () => {
    await createItem('ซื้อนม');
    await createItem('ซื้อขนมปัง');

    const res = await getItems();
    const body = await res.json();
    assert.equal(body.data.length, 2);
  });

  it('returns items ordered by createdAt asc', async () => {
    const items = await getItemsService();
    if (items.length > 1) {
      for (let i = 1; i < items.length; i++) {
        assert.ok(
          items[i].createdAt >= items[i - 1].createdAt,
          'Items should be ordered by createdAt ascending'
        );
      }
    }
  });
});

describe('POST /api/items (route → real SQLite)', () => {
  it('creates a new item and returns 201', async () => {
    await prisma.item.deleteMany();
    const res = await createItemRoute(
      makeReq('POST', '/api/items', { body: { title: 'ซื้อผัก' } })
    );
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.data.id);
    assert.equal(body.data.title, 'ซื้อผัก');
  });

  it('persists item to database', async () => {
    await prisma.item.deleteMany();
    await createItemRoute(makeReq('POST', '/api/items', { body: { title: 'ซื้อไข่' } }));
    const items = await getItemsService();
    assert.equal(items.length, 1);
    assert.equal(items[0].title, 'ซื้อไข่');
  });

  it('returns 400 when title is missing', async () => {
    const res = await createItemRoute(makeReq('POST', '/api/items', { body: {} }));
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'BAD_REQUEST');
  });

  it('returns 400 when title is empty string', async () => {
    const res = await createItemRoute(makeReq('POST', '/api/items', { body: { title: '' } }));
    assert.equal(res.status, 400);
  });

  it('returns 500 for malformed JSON (route catches all errors as INTERNAL_SERVER_ERROR)', async () => {
    const req = new Request('http://localhost:3000/api/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await createItemRoute(req as never);
    // The items route has a generic catch-all that returns 500 for JSON parse errors
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.code, 'INTERNAL_SERVER_ERROR');
  });
});

describe('itemService (service layer → real SQLite)', () => {
  it('createItem persists and returns item with id and createdAt', async () => {
    await prisma.item.deleteMany();
    const item = await createItem('ซื้อผลไม้');
    assert.ok(item.id > 0);
    assert.equal(item.title, 'ซื้อผลไม้');
    assert.ok(item.createdAt instanceof Date);
  });

  it('createItem throws when title is empty', async () => {
    await assert.rejects(
      () => createItem(''),
      (err: Error) => {
        assert.equal(err.message, 'Title is required and must be a string');
        return true;
      }
    );
  });

  it('getItems returns all items in createdAt order', async () => {
    await prisma.item.deleteMany();
    await createItem('A');
    await createItem('B');
    const items = await getItemsService();
    assert.equal(items.length, 2);
    assert.equal(items[0].title, 'A');
    assert.equal(items[1].title, 'B');
  });
});

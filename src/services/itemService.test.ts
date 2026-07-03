import test from 'node:test';
import assert from 'node:assert/strict';
import { getItems, createItem } from './itemService';
import { prisma } from '../lib/prisma';

test('itemService tests', async (t) => {
  // Clean up database before running tests
  await prisma.item.deleteMany();

  await t.test('should create a new item successfully', async () => {
    const title = 'ซื้อนม';
    const item = await createItem(title);
    
    assert.ok(item.id);
    assert.equal(item.title, title);
    assert.ok(item.createdAt instanceof Date);
  });

  await t.test('should retrieve created items', async () => {
    const items = await getItems();
    assert.equal(items.length, 1);
    assert.equal(items[0].title, 'ซื้อนม');
  });

  await t.test('should throw error when title is empty', async () => {
    await assert.rejects(
      async () => {
        await createItem('');
      },
      (err: Error) => {
        assert.equal(err.message, 'Title is required and must be a string');
        return true;
      }
    );
  });
  
  // Close database connection after tests
  t.after(async () => {
    await prisma.$disconnect();
  });
});

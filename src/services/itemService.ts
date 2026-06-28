import { prisma } from '../lib/db';
import type { Item } from '../types';

export async function getItems(): Promise<Item[]> {
  return prisma.item.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  });
}

export async function createItem(title: string): Promise<Item> {
  if (!title || typeof title !== 'string') {
    throw new Error('Title is required and must be a string');
  }
  return prisma.item.create({
    data: {
      title,
    },
  });
}

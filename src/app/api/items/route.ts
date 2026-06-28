import { NextRequest } from 'next/server';
import { getItems, createItem } from '../../../services/itemService';
import { ok, err } from '../../../lib/api-helpers';

export async function GET() {
  try {
    const items = await getItems();
    return ok(items);
  } catch (error) {
    console.error('Failed to get items:', error);
    const message = error instanceof Error ? error.message : 'Failed to retrieve items';
    return err('INTERNAL_SERVER_ERROR', message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title } = body;
    if (!title || typeof title !== 'string') {
      return err('BAD_REQUEST', 'Title is required and must be a string', 400);
    }
    const item = await createItem(title);
    return ok(item, 201);
  } catch (error) {
    console.error('Failed to create item:', error);
    const message = error instanceof Error ? error.message : 'Failed to create item';
    return err('INTERNAL_SERVER_ERROR', message, 500);
  }
}

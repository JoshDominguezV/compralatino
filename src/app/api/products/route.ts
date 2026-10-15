import { NextResponse } from 'next/server';
import { getProducts } from '@/modules/catalog/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase().trim() ?? '';
  const category = searchParams.get('category') ?? '';
  const products = await getProducts();
  return NextResponse.json({ products: products.filter((product) => (!category || category === 'Todo' || product.category === category) && (!query || `${product.title} ${product.category}`.toLowerCase().includes(query))) });
}

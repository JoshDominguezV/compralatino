import { FavoritesView } from '@/components/catalog/FavoritesView';
import { demoProducts, getProducts } from '@/modules/catalog/products';

export default async function FavoritesPage() {
  let products = demoProducts;
  try { products = await getProducts(); } catch {}
  return <FavoritesView products={products} />;
}

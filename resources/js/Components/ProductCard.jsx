import { Link, usePage } from '@inertiajs/react';
import ProductImage from './ProductImage';
import { formatPrice } from '../lib/format';

export default function ProductCard({ product, eager = false }) {
    const { site } = usePage().props;
    const price = formatPrice(product.price, site);
    const sale = formatPrice(product.sale_price, site);

    return (
        <Link href={`/produtos/${product.slug}`} className="group block" prefetch>
            <div className="relative">
                <ProductImage image={product.image} alt={product.name} eager={eager} hoverZoom />
                <div className="absolute left-0 top-0 flex flex-col items-start gap-1 p-2">
                    {product.sold_out && (
                        <span className="eyebrow bg-white/95 px-2.5 py-1.5 !text-[9px] text-ink">Esgotado</span>
                    )}
                    {!product.sold_out && sale && (
                        <span className="eyebrow bg-ink px-2.5 py-1.5 !text-[9px] text-champagne">Oferta</span>
                    )}
                </div>
            </div>
            <div className="mt-3 space-y-1 px-0.5">
                {product.category && <p className="eyebrow !text-[9px] text-muted">{product.category}</p>}
                <h3 className="font-serif text-[17px] leading-snug sm:text-lg">{product.name}</h3>
                {price && (
                    <p className="text-[13px] tracking-wide">
                        {sale ? (
                            <>
                                <span className="mr-2 text-muted line-through">{price}</span>
                                <span className="font-medium">{sale}</span>
                            </>
                        ) : (
                            price
                        )}
                    </p>
                )}
            </div>
        </Link>
    );
}

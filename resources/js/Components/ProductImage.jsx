import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { aspect } from '../lib/format';

/**
 * Imagem de produto padronizada (proporção do admin), com placeholder da mesma
 * proporção (sem layout shift), WebP + JPEG, srcset/sizes e lazy loading.
 */
export default function ProductImage({ image, alt, className = '', eager = false, sizes = '(min-width: 1024px) 25vw, 50vw', hoverZoom = false }) {
    const { site } = usePage().props;
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            className={`relative w-full overflow-hidden bg-soft ${className}`}
            style={{ aspectRatio: aspect(site.image_ratio), background: image?.placeholder || undefined }}
        >
            {image ? (
                <picture>
                    {image.srcset && <source type="image/webp" srcSet={image.srcset} sizes={sizes} />}
                    {image.srcsetJpg && <source type="image/jpeg" srcSet={image.srcsetJpg} sizes={sizes} />}
                    <img
                        src={image.src}
                        alt={image.alt || alt}
                        loading={eager ? 'eager' : 'lazy'}
                        fetchPriority={eager ? 'high' : undefined}
                        decoding="async"
                        onLoad={() => setLoaded(true)}
                        className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${hoverZoom ? 'group-hover:scale-[1.03]' : ''}`}
                    />
                </picture>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <img src={site.logo.monogram} alt="" className="w-10 opacity-15" />
                </div>
            )}
        </div>
    );
}

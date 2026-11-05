import { withBase } from '../../shared/paths';

/**
 * Hero mascot picture used at the top of tool pages: responsive webp with a jpg fallback.
 * Files: public/img/mascot-<name>-{600,1024}.{webp,jpg} (4:3).
 */
export function Mascot({ name, alt }: { name: string; alt: string }) {
  const src = (w: number, ext: string) => withBase(`/img/mascot-${name}-${w}.${ext}`);
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`${src(600, 'webp')} 600w, ${src(1024, 'webp')} 1024w`}
        sizes="(max-width: 768px) 100vw, 720px"
      />
      <img
        src={src(1024, 'jpg')}
        srcSet={`${src(600, 'jpg')} 600w, ${src(1024, 'jpg')} 1024w`}
        sizes="(max-width: 768px) 100vw, 720px"
        width={1024}
        height={768}
        alt={alt}
        className="mt-5 h-auto w-full rounded-2xl border border-stone-200 shadow-sm"
        fetchPriority="high"
      />
    </picture>
  );
}

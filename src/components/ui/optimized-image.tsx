import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string
  alt: string
  className?: string
}

export function OptimizedImage({
  src,
  alt,
  className,
  fill,
  sizes,
  ...props
}: OptimizedImageProps) {
  return (
    <div className={cn('relative overflow-hidden w-full h-full', className)}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes || (fill ? '(max-width: 768px) 100vw, 50vw' : undefined)}
        className="object-cover w-full h-full"
        {...props}
      />
    </div>
  )
}

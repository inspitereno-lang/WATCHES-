import React from 'react';
import { optimizeCloudinaryImage } from '../lib/cloudinary';

interface WatchImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/**
 * WatchImage — simple passthrough img component.
 * Background removal is handled server-side via remove.bg API,
 * so images already come through as transparent PNGs from Cloudinary.
 */
export const WatchImage: React.FC<WatchImageProps> = ({
  src,
  alt,
  className = '',
  style,
  width = 900,
  height = 900,
  loading = 'lazy',
  decoding = 'async',
  ...props
}) => {
  return (
    <img
      src={optimizeCloudinaryImage(src, typeof width === 'number' ? width : 900)}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default WatchImage;

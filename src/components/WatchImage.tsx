import React from 'react';

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
  ...props
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...props}
    />
  );
};

export default WatchImage;

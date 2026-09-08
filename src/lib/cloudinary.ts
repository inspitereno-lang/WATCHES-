const CLOUDINARY_IMAGE_MARKER = '/image/upload/'

export function optimizeCloudinaryImage(url: string, width = 1200) {
  if (!url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_IMAGE_MARKER)) {
    return url
  }

  const [prefix, assetPath] = url.split(CLOUDINARY_IMAGE_MARKER)
  if (!prefix || !assetPath || /(^|[,/])f_auto([,/]|$)/.test(assetPath)) return url

  const safeWidth = Math.max(200, Math.min(Math.round(width), 2400))
  return `${prefix}${CLOUDINARY_IMAGE_MARKER}f_auto,q_auto,dpr_auto,c_limit,w_${safeWidth}/${assetPath}`
}

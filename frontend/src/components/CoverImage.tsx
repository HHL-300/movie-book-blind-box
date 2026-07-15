'use client'

import { useState } from 'react'

const DEFAULT_COVER = 'https://api.dicebear.com/7.x/avataaars/svg?seed=movie'

interface CoverImageProps {
  src: string | undefined | null
  alt: string
  className?: string
  style?: React.CSSProperties
}

export default function CoverImage({ src, alt, className = '', style = {} }: CoverImageProps) {
  const [isError, setIsError] = useState(false)

  const getProxyUrl = (url: string): string => {
    if (!url || !url.trim()) {
      return DEFAULT_COVER
    }
    if (url.startsWith('https://img1.doubanio.com')) {
      return '/api/douban' + url.replace('https://img1.doubanio.com', '')
    }
    if (url.startsWith('https://img9.doubanio.com')) {
      return '/api/douban9' + url.replace('https://img9.doubanio.com', '')
    }
    return url
  }

  const finalSrc = isError ? DEFAULT_COVER : (src ? getProxyUrl(src) : DEFAULT_COVER)

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={style}
      onError={() => setIsError(true)}
    />
  )
}
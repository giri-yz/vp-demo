import { useState, type SyntheticEvent } from 'react';

const LOCAL_TEAM_DIR = '/images/team/';

function rendition(photo: string, width: number): { src: string; type?: string } | null {
  if (photo.includes('res.cloudinary.com/image/upload/')) {
    return { src: photo.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`) };
  }
  if (photo.startsWith(LOCAL_TEAM_DIR) && !photo.startsWith(`${LOCAL_TEAM_DIR}webp`)) {
    const dot = photo.lastIndexOf('.');
    if (dot === -1) return null;
    return { src: `${LOCAL_TEAM_DIR}webp${width}/${photo.slice(LOCAL_TEAM_DIR.length, dot)}.webp`, type: 'image/webp' };
  }
  return null;
}

interface TeamPhotoProps {
  src: string;
  alt: string;
  width: number;
  loading?: 'lazy' | 'eager';
  className?: string;
  onError: (e: SyntheticEvent<HTMLImageElement>) => void;
}

export default function TeamPhoto({ src, alt, width, loading, className, onError }: TeamPhotoProps) {
  const [original, setOriginal] = useState(false);
  const handle = (e: SyntheticEvent<HTMLImageElement>) => {
    if (!original) {
      setOriginal(true);
      return;
    }
    onError(e);
  };
  const img = <img src={src} alt={alt} className={className} loading={loading} decoding="async" onError={handle} />;
  const r = original ? null : rendition(src, width);
  if (!r) return img;
  return (
    <picture>
      <source srcSet={r.src} type={r.type} />
      {img}
    </picture>
  );
}

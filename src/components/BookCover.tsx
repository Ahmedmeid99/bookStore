import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  coverUrl: string | null;
  title: string;
  className?: string;
}

export function BookCover({ coverUrl, title, className = '' }: BookCoverProps) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!coverUrl || imgError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-ivory-200 to-ivory-300 text-navy-400 ${className}`}
        aria-label={title}
      >
        <BookOpen className="h-10 w-10 mb-2 opacity-50" />
        <span className="px-3 text-center text-xs font-medium line-clamp-3">{title}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-ivory-200 ${className}`}>
      {!loaded && <div className="absolute inset-0 skeleton" />}
      <img
        src={coverUrl}
        alt={title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setImgError(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}

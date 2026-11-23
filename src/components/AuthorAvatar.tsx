import { useState } from 'react';

interface AuthorAvatarProps {
  name: string;
  photoUrl: string | null;
  className?: string;
}

export function AuthorAvatar({ name, photoUrl, className = 'h-16 w-16' }: AuthorAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(photoUrl) && !imageFailed;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gold-500/30 via-gold-400/15 to-navy-900 font-serif text-2xl font-bold text-gold-300 shadow-md ${className}`}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : name}
    >
      {showImage ? (
        <img
          src={photoUrl!}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{name.trim().charAt(0) || '?'}</span>
      )}
    </div>
  );
}

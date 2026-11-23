import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  count?: number;
}

export function StarRating({ rating, size = 'md', showNumber = false, count }: StarRatingProps) {
  const sizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const starSize = sizes[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(rating);
          return (
            <Star
              key={star}
              className={`${starSize} ${filled ? 'fill-gold-400 text-gold-400' : 'text-ivory-300'}`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-navy-700">{rating.toFixed(1)}</span>
      )}
      {count != null && (
        <span className="text-xs text-navy-400">({count})</span>
      )}
    </div>
  );
}

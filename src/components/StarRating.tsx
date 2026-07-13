interface StarRatingProps {
  value: number | null
  onChange?: (value: number | null) => void
  label: string
}

export function StarRating({ value, onChange, label }: StarRatingProps) {
  const readonly = !onChange
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className={`star-rating ${readonly ? 'readonly' : ''}`}>
      <span className="star-rating-label">{label}</span>
      <div className="stars">
        {stars.map((star) => (
          <button
            type="button"
            key={star}
            className={`star ${value != null && star <= value ? 'filled' : ''}`}
            disabled={readonly}
            aria-label={`${label} ${star} van 5`}
            onClick={() => onChange?.(value === star ? null : star)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}

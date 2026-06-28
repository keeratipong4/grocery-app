interface Props {
  discount: number;
}

export default function DiscountBadge({ discount }: Props) {
  if (discount <= 0) return null;
  return (
    <span className="absolute top-2 left-2 bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
      -{discount}%
    </span>
  );
}

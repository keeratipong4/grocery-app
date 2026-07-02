interface Props {
  isNew: boolean;
  discount: number;
}

export default function NewBadge({ isNew, discount }: Props) {
  if (!isNew || discount > 0) return null;
  return (
    <span className="absolute top-2 left-2 bg-success text-white text-xs font-bold px-2 py-0.5 rounded-full">
      ใหม่
    </span>
  );
}

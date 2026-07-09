import Link from 'next/link';

interface Props {
  title: string;
  href?: string;
  right?: React.ReactNode;
}

export default function SectionHeader({ title, href, right }: Props) {
  return (
    <div className="flex items-center justify-between mb-8 gap-4">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {right ?? (
        href && (
          <Link href={href} className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">
            ดูทั้งหมด →
          </Link>
        )
      )}
    </div>
  );
}

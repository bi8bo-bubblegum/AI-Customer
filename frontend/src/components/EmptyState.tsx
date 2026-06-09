interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* 大图标 */}
      <div className="mb-4 text-slate-300 [&>svg]:h-16 [&>svg]:w-16">
        {icon}
      </div>
      {/* 标题 */}
      <h3 className="mb-1 text-lg font-medium text-slate-400">{title}</h3>
      {/* 描述 */}
      {description && (
        <p className="text-sm text-slate-400">{description}</p>
      )}
    </div>
  );
}

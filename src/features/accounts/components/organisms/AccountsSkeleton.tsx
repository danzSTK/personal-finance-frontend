const skeletonKeys = ['create', 'primary', 'secondary', 'tertiary']

export function AccountsSkeleton() {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="Carregando contas"
    >
      {skeletonKeys.map((key) => (
        <div
          key={key}
          className="min-h-56 animate-pulse rounded-2xl border border-border bg-secondary"
        />
      ))}
    </div>
  )
}

type CategoriesSummaryCardProps = {
  label: string;
  value: string;
};

export function CategoriesSummaryCard({ label, value }: CategoriesSummaryCardProps) {
  return (
    <article className="finance-summary-card">
      <span className="finance-summary-card__label">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

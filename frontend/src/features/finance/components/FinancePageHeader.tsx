type FinancePageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function FinancePageHeader({
  description,
  eyebrow,
  title,
}: FinancePageHeaderProps) {
  void eyebrow;

  return (
    <section className="finance-header">
      <h2>{title}</h2>
      <p className="finance-header__copy">{description}</p>
    </section>
  );
}

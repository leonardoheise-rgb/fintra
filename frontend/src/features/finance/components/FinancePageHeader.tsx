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
  return (
    <section className="finance-header">
      <p className="finance-header__eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="finance-header__copy">{description}</p>
    </section>
  );
}

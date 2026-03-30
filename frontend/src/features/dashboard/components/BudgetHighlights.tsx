import { Link } from 'react-router-dom';

import { calculateBudgetSummary } from '../../../shared/lib/budget/budgetSummary';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import type { BudgetCard } from '../dashboard.types';

type BudgetHighlightsProps = {
  cards: BudgetCard[];
};

export function BudgetHighlights({ cards }: BudgetHighlightsProps) {
  return (
    <section className="section-stack" aria-labelledby="budget-highlights-title">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Budget posture</p>
          <h3 id="budget-highlights-title">Category highlights</h3>
        </div>
        <Link className="secondary-button" to="/budgets">
          Edit default budgets
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="insight-panel">
          <p className="insight-panel__copy">
            No default budgets are configured yet. Add your first plan to unlock category pacing on
            the dashboard.
          </p>
        </div>
      ) : (
        <div className="budget-grid">
          {cards.map((card) => {
            const summary = calculateBudgetSummary({
              budget: card.defaultBudget,
              spent: card.spent,
            });

            return (
              <article className="budget-card" key={card.id}>
                <div className="budget-card__header">
                  <div className="budget-card__badge" aria-hidden="true">
                    {card.shortLabel}
                  </div>
                  <div>
                    <p className="budget-card__eyebrow">Default budget</p>
                    <h4>{card.name}</h4>
                  </div>
                </div>

                <p className="budget-card__amount">{formatCurrency(summary.remaining)}</p>
                <p className="budget-card__caption">
                  {formatCurrency(card.spent)} spent of {formatCurrency(card.defaultBudget)}
                </p>

                <div className="budget-card__track" aria-hidden="true">
                  <div
                    className={`budget-card__fill budget-card__fill--${summary.status}`}
                    style={{ width: `${summary.progressPercentage}%` }}
                  />
                </div>

                <div className="budget-card__footer">
                  <span>{Math.round(summary.rawPercentage)}% used</span>
                  <span>{summary.status === 'over' ? 'Needs attention' : 'On track'}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

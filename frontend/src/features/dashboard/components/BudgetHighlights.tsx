import { Link } from 'react-router-dom';

import { translateAppText } from '../../../shared/i18n/appText';
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
          <p className="section-heading__eyebrow">{translateAppText('dashboard.budgetPosture')}</p>
          <h3 id="budget-highlights-title">{translateAppText('dashboard.categoryHighlights')}</h3>
        </div>
        <Link className="secondary-button" to="/budgets">
          {translateAppText('dashboard.editDefaultBudgets')}
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="insight-panel">
          <p className="insight-panel__copy">{translateAppText('dashboard.noBudgets')}</p>
        </div>
      ) : (
        <div className="budget-grid">
          {cards.map((card) => {
            const summary = calculateBudgetSummary({
              budget: card.effectiveBudget,
              spent: card.spent,
            });

            return (
              <article className="budget-card" key={card.id}>
                <div className="budget-card__header">
                  <div className="budget-card__badge" aria-hidden="true">
                    {card.shortLabel}
                  </div>
                  <div>
                    <p className="budget-card__eyebrow">
                      {card.isOverridden
                        ? translateAppText('dashboard.monthlyOverride')
                        : translateAppText('dashboard.defaultBudgetLabel')}
                    </p>
                    <h4>{card.name}</h4>
                  </div>
                </div>

                <p className="budget-card__amount">{formatCurrency(summary.remaining)}</p>
                <p className="budget-card__caption">
                  {translateAppText('dashboard.spentOfBudget', {
                    spent: formatCurrency(card.spent),
                    budget: formatCurrency(card.effectiveBudget),
                  })}
                </p>

                <div
                  aria-label={`${card.name} budget usage`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={Math.round(summary.rawPercentage)}
                  className="budget-card__track"
                  role="progressbar"
                >
                  <div
                    className={`budget-card__fill budget-card__fill--${summary.status}`}
                    style={{ width: `${summary.progressPercentage}%` }}
                  />
                </div>

                <div className="budget-card__footer">
                  <span>
                    {translateAppText('dashboard.percentUsed', {
                      percent: Math.round(summary.rawPercentage),
                    })}
                  </span>
                  <span>
                    {card.isOverridden
                      ? translateAppText('dashboard.overrideActiveFrom', {
                          amount: formatCurrency(card.defaultBudget),
                        })
                      : summary.status === 'over'
                        ? translateAppText('dashboard.needsAttention')
                        : translateAppText('dashboard.onTrack')}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

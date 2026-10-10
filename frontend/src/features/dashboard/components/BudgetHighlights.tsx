import { Link } from 'react-router-dom';

import { translateAppText } from '../../../shared/i18n/appText';
import { calculateBudgetSummary } from '../../../shared/lib/budget/budgetSummary';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import type { BudgetCard } from '../dashboard.types';

type BudgetHighlightsProps = {
  cards: BudgetCard[];
  onSelectCategory(categoryId: string): void;
};

export function BudgetHighlights({ cards, onSelectCategory }: BudgetHighlightsProps) {
  return (
    <section className="section-stack" aria-labelledby="budget-highlights-title">
      <div className="section-heading">
        <div>
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
              spent: card.spent + card.reserved,
            });
            const spentSummary = calculateBudgetSummary({
              budget: card.effectiveBudget,
              spent: card.spent,
            });
            const forecastProgressPercentage = Math.max(
              0,
              summary.progressPercentage - spentSummary.progressPercentage,
            );
            const cardTone =
              summary.status === 'over' ? 'overused' : summary.status === 'at' ? 'used' : 'default';

            return (
              <button
                className={`budget-card budget-card--${cardTone} budget-card--interactive`}
                key={card.id}
                onClick={() => onSelectCategory(card.id)}
                type="button"
              >
                <div className="budget-card__header">
                  <div className="budget-card__badge" aria-hidden="true">
                    {card.icon ?? card.shortLabel}
                  </div>
                  <div>
                    {card.isOverridden ? (
                      <p className="budget-card__eyebrow">
                        {translateAppText('dashboard.monthlyOverride')}
                      </p>
                    ) : null}
                    <h4>{card.name}</h4>
                  </div>
                </div>

                <p className="budget-card__amount">{formatCurrency(summary.remaining)}</p>
                <p className="budget-card__caption">
                  {translateAppText('dashboard.idealPaceAmount', {
                    percent: Math.round(card.idealPacePercentage),
                    amount: formatCurrency(card.idealPaceAmount),
                  })}
                </p>
                {card.historicalMonthlyAverage !== null ? (
                  <p className="budget-card__caption">
                    {translateAppText('dashboard.historicalMonthlyAverage', {
                      amount: formatCurrency(card.historicalMonthlyAverage),
                    })}
                  </p>
                ) : null}
                <p className="budget-card__caption">
                  {translateAppText('dashboard.spentOfBudget', {
                    spent: formatCurrency(card.spent),
                    budget: formatCurrency(card.effectiveBudget),
                  })}
                </p>
                {card.reserved > 0 ? (
                  <p className="budget-card__caption">
                    {translateAppText('dashboard.reservedOfBudget', {
                      reserved: formatCurrency(card.reserved),
                    })}
                  </p>
                ) : null}

                <div
                  aria-label={`${card.name} budget usage`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={Math.round(summary.rawPercentage)}
                  className="budget-card__track"
                  role="progressbar"
                >
                  <div
                    className="budget-card__fill budget-card__fill--spent"
                    style={{ width: `${spentSummary.progressPercentage}%` }}
                  />
                  {forecastProgressPercentage > 0 ? (
                    <div
                      className="budget-card__fill budget-card__fill--forecast"
                      style={{ width: `${forecastProgressPercentage}%` }}
                    />
                  ) : null}
                </div>

                <div className="budget-card__footer">
                  <span>
                    {translateAppText('dashboard.percentUsed', {
                      percent: Math.round(summary.rawPercentage),
                    })}
                  </span>
                  <span className="budget-card__pace budget-card__pace--neutral">
                    {translateAppText('dashboard.idealPace')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

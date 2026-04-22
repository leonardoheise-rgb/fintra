import { Link } from 'react-router-dom';

import { useDisplayPreferences } from '../../settings/useDisplayPreferences';
import { translateAppText } from '../../../shared/i18n/appText';
import { calculateBudgetSummary } from '../../../shared/lib/budget/budgetSummary';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { resolveBudgetPacing } from '../lib/budgetPacing';
import type { BudgetCard } from '../dashboard.types';

type BudgetHighlightsProps = {
  cards: BudgetCard[];
  month: string;
  onSelectCategory(categoryId: string): void;
};

export function BudgetHighlights({ cards, month, onSelectCategory }: BudgetHighlightsProps) {
  const {
    preferences: { monthStartDay },
  } = useDisplayPreferences();

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
            const pacing = resolveBudgetPacing(summary.rawPercentage, month, monthStartDay);
            const cardTone =
              summary.status === 'over' ? 'overused' : summary.status === 'at' ? 'used' : 'default';
            const paceLabel =
              summary.status === 'over'
                ? translateAppText('dashboard.overused')
                : summary.status === 'at'
                  ? translateAppText('dashboard.allUsed')
                  : pacing.status === 'above'
                    ? translateAppText('dashboard.aboveIdeal')
                    : pacing.status === 'below'
                      ? translateAppText('dashboard.belowIdeal')
                      : translateAppText('dashboard.alignedWithIdeal');
            const paceTone =
              summary.status === 'over' || summary.status === 'at'
                ? 'alert'
                : pacing.status === 'above'
                  ? 'alert'
                  : pacing.status === 'below'
                    ? 'calm'
                    : 'neutral';

            return (
              <button
                className={`budget-card budget-card--${cardTone} budget-card--interactive`}
                key={card.id}
                onClick={() => onSelectCategory(card.id)}
                type="button"
              >
                <div className="budget-card__header">
                  <div className="budget-card__badge" aria-hidden="true">
                    {card.shortLabel}
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
                  {translateAppText('dashboard.todayAvailableToSpend', {
                    amount: formatCurrency(card.todayAvailableToSpend),
                  })}
                </p>
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
                  <span className={`budget-card__pace budget-card__pace--${paceTone}`}>
                    {paceLabel}
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

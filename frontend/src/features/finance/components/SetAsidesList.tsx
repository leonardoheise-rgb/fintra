import { useState } from 'react';

import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { translateAppText } from '../../../shared/i18n/appText';
import type {
  CategoryRecord,
  SetAsideRecord,
  SubcategoryRecord,
} from '../finance.types';
import {
  getCategoryName,
  getCategoryIcon,
  getSubcategoryIcon,
  getSubcategoryName,
} from '../lib/financeSelectors';
import { sortSetAsidesByDateAsc } from '../lib/setAsides';

type SetAsidesListProps = {
  categories: CategoryRecord[];
  onDiscard(setAsideId: string): Promise<void>;
  setAsides: SetAsideRecord[];
  subcategories: SubcategoryRecord[];
};

export function SetAsidesList({
  categories,
  onDiscard,
  setAsides,
  subcategories,
}: SetAsidesListProps) {
  const sortedSetAsides = sortSetAsidesByDateAsc(setAsides);
  const [expandedSetAsideIds, setExpandedSetAsideIds] = useState<string[]>([]);

  function toggleExpandedSetAside(setAsideId: string) {
    setExpandedSetAsideIds((currentIds) =>
      currentIds.includes(setAsideId)
        ? currentIds.filter((id) => id !== setAsideId)
        : [...currentIds, setAsideId],
    );
  }

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('setAsides.listEyebrow')}</p>
          <h2>{translateAppText('setAsides.listHeading')}</h2>
        </div>
      </div>

      {sortedSetAsides.length === 0 ? (
        <p className="finance-empty-state">{translateAppText('setAsides.empty')}</p>
      ) : (
        <div className="finance-list">
          {sortedSetAsides.map((setAside) => {
            const isExpanded = expandedSetAsideIds.includes(setAside.id);
            const displayIcon =
              getSubcategoryIcon(subcategories, setAside.subcategoryId) ??
              getCategoryIcon(categories, setAside.categoryId) ??
              'RS';

            return (
              <article className="transaction-card transaction-card--collapsible" key={setAside.id}>
                <div className="transaction-card__main">
                  <div className="transaction-card__summary">
                    <div className="ledger-row__icon" aria-hidden="true">
                      {displayIcon}
                    </div>
                    <div>
                      <p className="transaction-card__eyebrow">{translateAppText('setAsides.arrivesOn')}</p>
                      <h3>{setAside.description || translateAppText('setAsides.defaultDescription')}</h3>
                      <p className="transaction-card__meta">{setAside.date}</p>
                    </div>
                  </div>
                  <div className="transaction-card__amounts">
                    <strong className="transaction-card__amount transaction-card__amount--expense">
                      {formatCurrency(setAside.amount)}
                    </strong>
                    <button
                      className="secondary-button transaction-card__toggle"
                      onClick={() => toggleExpandedSetAside(setAside.id)}
                      type="button"
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <>
                    <p className="transaction-card__meta">
                      {getCategoryName(categories, setAside.categoryId)}
                      {' / '}
                      {getSubcategoryName(subcategories, setAside.subcategoryId)}
                    </p>

                    <div className="transaction-card__actions">
                      <button
                        className="secondary-button secondary-button--danger"
                        onClick={() => void onDiscard(setAside.id)}
                        type="button"
                      >
                        {translateAppText('setAsides.discard')}
                      </button>
                    </div>
                  </>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

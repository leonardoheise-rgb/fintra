import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { translateAppText } from '../../../shared/i18n/appText';
import type {
  CategoryRecord,
  SetAsideRecord,
  SubcategoryRecord,
} from '../finance.types';
import { getCategoryName, getSubcategoryName } from '../lib/financeSelectors';
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
          {sortedSetAsides.map((setAside) => (
            <article className="transaction-card" key={setAside.id}>
              <div className="transaction-card__main">
                <div>
                  <p className="transaction-card__eyebrow">{translateAppText('setAsides.arrivesOn')}</p>
                  <h3>{setAside.description || translateAppText('setAsides.defaultDescription')}</h3>
                </div>
                <div className="transaction-card__amounts">
                  <strong className="transaction-card__amount transaction-card__amount--expense">
                    {formatCurrency(setAside.amount)}
                  </strong>
                </div>
              </div>

              <p className="transaction-card__meta">{setAside.date}</p>
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

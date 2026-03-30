import { useFinanceData } from '../useFinanceData';
import { CategoriesManager } from '../components/CategoriesManager';
import { CategoriesSummaryCard } from '../components/CategoriesSummaryCard';
import { FinancePageHeader } from '../components/FinancePageHeader';
import { translateAppText } from '../../../shared/i18n/appText';

export function CategoriesPage() {
  const financeData = useFinanceData();

  return (
    <div className="finance-page">
      <FinancePageHeader
        description={translateAppText('categories.description')}
        eyebrow={translateAppText('categories.eyebrow')}
        title={translateAppText('categories.title')}
      />

      <section className="finance-summary-grid">
        <CategoriesSummaryCard
          label={translateAppText('categories.count')}
          value={String(financeData.categories.length)}
        />
        <CategoriesSummaryCard
          label={translateAppText('categories.subcategories')}
          value={String(financeData.subcategories.length)}
        />
        <CategoriesSummaryCard
          label={translateAppText('categories.scopedTransactions')}
          value={String(financeData.transactions.length)}
        />
      </section>

      {financeData.status === 'loading' ? (
        <section className="finance-panel">
          <p className="finance-empty-state">{translateAppText('categories.loading')}</p>
        </section>
      ) : (
        <CategoriesManager
          categories={financeData.categories}
          errorMessage={financeData.errorMessage}
          onCreateCategory={async (name) => financeData.createCategory({ name })}
          onCreateSubcategory={financeData.createSubcategory}
          onDeleteCategory={financeData.deleteCategory}
          onDeleteSubcategory={financeData.deleteSubcategory}
          onUpdateCategory={async (categoryId, name) =>
            financeData.updateCategory(categoryId, { name })
          }
          onUpdateSubcategory={financeData.updateSubcategory}
          subcategories={financeData.subcategories}
          transactions={financeData.transactions}
        />
      )}
    </div>
  );
}

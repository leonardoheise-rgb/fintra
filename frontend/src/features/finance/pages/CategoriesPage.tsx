import { useFinanceData } from '../useFinanceData';
import { CategoriesManager } from '../components/CategoriesManager';
import { CategoriesSummaryCard } from '../components/CategoriesSummaryCard';
import { FinancePageHeader } from '../components/FinancePageHeader';

export function CategoriesPage() {
  const financeData = useFinanceData();

  return (
    <div className="finance-page">
      <FinancePageHeader
        description="Build the category tree that transactions depend on. Duplicate prevention and delete guards are active so the data model stays predictable before budget logic arrives."
        eyebrow="Sprint 2"
        title="Categories"
      />

      <section className="finance-summary-grid">
        <CategoriesSummaryCard
          label="Categories"
          value={String(financeData.categories.length)}
        />
        <CategoriesSummaryCard
          label="Subcategories"
          value={String(financeData.subcategories.length)}
        />
        <CategoriesSummaryCard
          label="Scoped transactions"
          value={String(financeData.transactions.length)}
        />
      </section>

      {financeData.status === 'loading' ? (
        <section className="finance-panel">
          <p className="finance-empty-state">Loading categories...</p>
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

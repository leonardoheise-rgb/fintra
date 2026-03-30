import { useFinanceData } from '../useFinanceData';
import { CategoriesManager } from '../components/CategoriesManager';
import { translateAppText } from '../../../shared/i18n/appText';

export function CategoriesPage() {
  const financeData = useFinanceData();

  return (
    <div className="finance-page">
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

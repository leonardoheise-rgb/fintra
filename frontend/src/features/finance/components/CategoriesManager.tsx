import { useEffect, useState, type FormEvent } from 'react';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
import { getSubcategoriesForCategory } from '../lib/financeSelectors';
import type {
  CategoryInput,
  CategoryRecord,
  SubcategoryInput,
  SubcategoryRecord,
  TransactionRecord,
} from '../finance.types';

type CategoriesManagerProps = {
  categories: CategoryRecord[];
  errorMessage: string | null;
  onCreateCategory(input: CategoryInput): Promise<void>;
  onCreateSubcategory(input: SubcategoryInput): Promise<void>;
  onDeleteCategory(categoryId: string): Promise<void>;
  onDeleteSubcategory(subcategoryId: string): Promise<void>;
  onUpdateCategory(categoryId: string, input: CategoryInput): Promise<void>;
  onUpdateSubcategory(subcategoryId: string, input: SubcategoryInput): Promise<void>;
  subcategories: SubcategoryRecord[];
  transactions: TransactionRecord[];
};

export function CategoriesManager({
  categories,
  errorMessage,
  onCreateCategory,
  onCreateSubcategory,
  onDeleteCategory,
  onDeleteSubcategory,
  onUpdateCategory,
  onUpdateSubcategory,
  subcategories,
  transactions,
}: CategoriesManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryIcon, setNewSubcategoryIcon] = useState('');
  const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] = useState(categories[0]?.id ?? '');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryIcon, setEditingCategoryIcon] = useState('');
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [editingSubcategoryName, setEditingSubcategoryName] = useState('');
  const [editingSubcategoryIcon, setEditingSubcategoryIcon] = useState('');
  const [editingSubcategoryCategoryId, setEditingSubcategoryCategoryId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!newSubcategoryCategoryId && categories[0]) {
      setNewSubcategoryCategoryId(categories[0].id);
    }
  }, [categories, newSubcategoryCategoryId]);

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newCategoryName.trim()) {
      setFormError(translateAppText('categories.errorNameRequired'));
      return;
    }

    setFormError(null);

    try {
      await onCreateCategory({
        name: newCategoryName,
        icon: newCategoryIcon,
      });
      setNewCategoryName('');
      setNewCategoryIcon('');
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'categories.errorCreate'));
    }
  }

  async function handleSubcategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newSubcategoryCategoryId) {
      setFormError(translateAppText('categories.errorPickCategory'));
      return;
    }

    if (!newSubcategoryName.trim()) {
      setFormError(translateAppText('categories.errorSubcategoryNameRequired'));
      return;
    }

    setFormError(null);

    try {
      await onCreateSubcategory({
        categoryId: newSubcategoryCategoryId,
        name: newSubcategoryName,
        icon: newSubcategoryIcon,
      });
      setNewSubcategoryName('');
      setNewSubcategoryIcon('');
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'categories.errorCreateSubcategory'));
    }
  }

  return (
    <div className="finance-grid finance-grid--stacked">
      <section className="finance-panel categories-setup-panel">
        <div className="finance-panel__heading">
          <div>
            <p className="finance-panel__eyebrow">{translateAppText('categories.setup')}</p>
            <h2>{translateAppText('categories.newCategory')}</h2>
          </div>
        </div>

        <form className="finance-form finance-form--inline" onSubmit={handleCategorySubmit}>
          <label className="finance-field finance-field--full">
            <span>{translateAppText('categories.newCategory')}</span>
            <input
              name="newCategory"
              onChange={(event) => setNewCategoryName(event.target.value)}
              type="text"
              value={newCategoryName}
            />
          </label>
          <label className="finance-field">
            <span>Icon</span>
            <input
              maxLength={8}
              name="newCategoryIcon"
              onChange={(event) => setNewCategoryIcon(event.target.value)}
              placeholder="e.g. 🏠"
              type="text"
              value={newCategoryIcon}
            />
          </label>
          <button className="primary-button finance-form__submit" type="submit">
            {translateAppText('categories.addCategory')}
          </button>
        </form>
      </section>

      <section className="finance-panel categories-setup-panel">
        <div className="finance-panel__heading">
          <div>
            <p className="finance-panel__eyebrow">{translateAppText('categories.setup')}</p>
            <h2>{translateAppText('categories.newSubcategory')}</h2>
          </div>
        </div>

        <form className="finance-form finance-form--inline" onSubmit={handleSubcategorySubmit}>
          <label className="finance-field">
            <span>{translateAppText('transactions.category')}</span>
            <select
              name="newSubcategoryCategory"
              onChange={(event) => setNewSubcategoryCategoryId(event.target.value)}
              value={newSubcategoryCategoryId}
            >
              {categories.length === 0 ? <option value="">{translateAppText('transactions.noCategoriesYet')}</option> : null}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="finance-field finance-field--full">
            <span>{translateAppText('categories.newSubcategory')}</span>
            <input
              name="newSubcategory"
              onChange={(event) => setNewSubcategoryName(event.target.value)}
              type="text"
              value={newSubcategoryName}
            />
          </label>
          <label className="finance-field">
            <span>Icon</span>
            <input
              maxLength={8}
              name="newSubcategoryIcon"
              onChange={(event) => setNewSubcategoryIcon(event.target.value)}
              placeholder="e.g. 🍽️"
              type="text"
              value={newSubcategoryIcon}
            />
          </label>

          <button className="secondary-button finance-form__submit" type="submit">
            {translateAppText('categories.addSubcategory')}
          </button>
        </form>

        {formError ? <p className="finance-message finance-message--error">{formError}</p> : null}
        {errorMessage ? <p className="finance-message finance-message--error">{errorMessage}</p> : null}
      </section>

      <section className="finance-panel">
        <div className="finance-panel__heading">
          <div>
            <p className="finance-panel__eyebrow">{translateAppText('categories.currentStructure')}</p>
            <h2>{translateAppText('categories.manageStructure')}</h2>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="finance-empty-state">{translateAppText('categories.empty')}</p>
        ) : (
          <div className="finance-list">
            {categories.map((category) => {
              const categorySubcategories = getSubcategoriesForCategory(subcategories, category.id);
              const transactionCount = transactions.filter(
                (transaction) => transaction.categoryId === category.id,
              ).length;

              return (
                <article className="category-card" key={category.id}>
                  <div className="category-card__section category-card__section--primary">
                    <div className="category-card__header">
                      <div>
                        <p className="category-card__eyebrow">
                          {translateAppText('categories.transactionsCount', {
                            count: transactionCount,
                          })}
                        </p>
                        {editingCategoryId === category.id ? (
                          <form
                            className="category-card__edit-form"
                            onSubmit={(event) => {
                              event.preventDefault();
                              void onUpdateCategory(category.id, {
                                name: editingCategoryName,
                                icon: editingCategoryIcon,
                              })
                                .then(() => {
                                  setEditingCategoryId(null);
                                  setEditingCategoryName('');
                                  setEditingCategoryIcon('');
                                })
                                .catch((error) => {
                                  setFormError(resolveAppErrorMessage(error, 'categories.errorUpdate'));
                                });
                            }}
                          >
                            <input
                              onChange={(event) => setEditingCategoryName(event.target.value)}
                              type="text"
                              value={editingCategoryName}
                            />
                            <input
                              maxLength={8}
                              onChange={(event) => setEditingCategoryIcon(event.target.value)}
                              placeholder="Icon"
                              type="text"
                              value={editingCategoryIcon}
                            />
                            <button className="secondary-button" type="submit">
                              {translateAppText('categories.save')}
                            </button>
                          </form>
                        ) : (
                          <h3>{category.icon ? `${category.icon} ${category.name}` : category.name}</h3>
                        )}
                      </div>

                      <div className="transaction-card__actions">
                        <button
                          className="secondary-button"
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setEditingCategoryName(category.name);
                            setEditingCategoryIcon(category.icon ?? '');
                          }}
                          type="button"
                        >
                          {translateAppText('transactions.edit')}
                        </button>
                        <button
                          className="secondary-button secondary-button--danger"
                          onClick={() => void onDeleteCategory(category.id)}
                          type="button"
                        >
                          {translateAppText('transactions.delete')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="category-card__section category-card__section--secondary">
                    {categorySubcategories.length === 0 ? (
                      <p className="category-card__subcopy">{translateAppText('categories.noSubcategoriesYet')}</p>
                    ) : (
                      <div className="subcategory-list">
                        {categorySubcategories.map((subcategory) => (
                          <div className="subcategory-chip" key={subcategory.id}>
                            {editingSubcategoryId === subcategory.id ? (
                              <form
                                className="subcategory-chip__edit-form"
                                onSubmit={(event) => {
                                  event.preventDefault();
                                  void onUpdateSubcategory(subcategory.id, {
                                    categoryId: editingSubcategoryCategoryId,
                                    name: editingSubcategoryName,
                                    icon: editingSubcategoryIcon,
                                  })
                                    .then(() => {
                                      setEditingSubcategoryId(null);
                                      setEditingSubcategoryName('');
                                      setEditingSubcategoryIcon('');
                                      setEditingSubcategoryCategoryId('');
                                    })
                                    .catch((error) => {
                                      setFormError(
                                        resolveAppErrorMessage(error, 'categories.errorUpdateSubcategory'),
                                      );
                                    });
                                }}
                              >
                                <input
                                  onChange={(event) => setEditingSubcategoryName(event.target.value)}
                                  type="text"
                                  value={editingSubcategoryName}
                                />
                                <input
                                  maxLength={8}
                                  onChange={(event) => setEditingSubcategoryIcon(event.target.value)}
                                  placeholder="Icon"
                                  type="text"
                                  value={editingSubcategoryIcon}
                                />
                                <select
                                  onChange={(event) =>
                                    setEditingSubcategoryCategoryId(event.target.value)
                                  }
                                  value={editingSubcategoryCategoryId}
                                >
                                  {categories.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                                <button className="secondary-button" type="submit">
                                  {translateAppText('categories.save')}
                                </button>
                              </form>
                            ) : (
                              <>
                                <span>
                                  {subcategory.icon ? `${subcategory.icon} ${subcategory.name}` : subcategory.name}
                                </span>
                                <div className="subcategory-chip__actions">
                                  <button
                                    className="subcategory-chip__button"
                                    onClick={() => {
                                      setEditingSubcategoryId(subcategory.id);
                                      setEditingSubcategoryName(subcategory.name);
                                      setEditingSubcategoryIcon(subcategory.icon ?? '');
                                      setEditingSubcategoryCategoryId(subcategory.categoryId);
                                    }}
                                    type="button"
                                  >
                                    {translateAppText('transactions.edit')}
                                  </button>
                                  <button
                                    className="subcategory-chip__button"
                                    onClick={() => void onDeleteSubcategory(subcategory.id)}
                                    type="button"
                                  >
                                    {translateAppText('transactions.delete')}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

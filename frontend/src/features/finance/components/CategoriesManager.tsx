import { useEffect, useState, type FormEvent } from 'react';

import { getSubcategoriesForCategory } from '../lib/financeSelectors';
import type {
  CategoryRecord,
  SubcategoryRecord,
  TransactionRecord,
} from '../finance.types';

type CategoriesManagerProps = {
  categories: CategoryRecord[];
  errorMessage: string | null;
  onCreateCategory(name: string): Promise<void>;
  onCreateSubcategory(input: { categoryId: string; name: string }): Promise<void>;
  onDeleteCategory(categoryId: string): Promise<void>;
  onDeleteSubcategory(subcategoryId: string): Promise<void>;
  onUpdateCategory(categoryId: string, name: string): Promise<void>;
  onUpdateSubcategory(subcategoryId: string, input: { categoryId: string; name: string }): Promise<void>;
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
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] = useState(categories[0]?.id ?? '');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [editingSubcategoryName, setEditingSubcategoryName] = useState('');
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
      setFormError('Category name is required.');
      return;
    }

    setFormError(null);

    try {
      await onCreateCategory(newCategoryName);
      setNewCategoryName('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create the category.');
    }
  }

  async function handleSubcategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newSubcategoryCategoryId) {
      setFormError('Pick a category first.');
      return;
    }

    if (!newSubcategoryName.trim()) {
      setFormError('Subcategory name is required.');
      return;
    }

    setFormError(null);

    try {
      await onCreateSubcategory({
        categoryId: newSubcategoryCategoryId,
        name: newSubcategoryName,
      });
      setNewSubcategoryName('');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create the subcategory.');
    }
  }

  return (
    <div className="finance-grid finance-grid--stacked">
      <section className="finance-panel">
        <div className="finance-panel__heading">
          <div>
            <p className="finance-panel__eyebrow">Category setup</p>
            <h2>Manage categories</h2>
          </div>
        </div>

        <form className="finance-form finance-form--inline" onSubmit={handleCategorySubmit}>
          <label className="finance-field finance-field--full">
            <span>New category</span>
            <input
              name="newCategory"
              onChange={(event) => setNewCategoryName(event.target.value)}
              type="text"
              value={newCategoryName}
            />
          </label>
          <button className="primary-button finance-form__submit" type="submit">
            Add category
          </button>
        </form>

        <form className="finance-form finance-form--inline" onSubmit={handleSubcategorySubmit}>
          <label className="finance-field">
            <span>Category</span>
            <select
              name="newSubcategoryCategory"
              onChange={(event) => setNewSubcategoryCategoryId(event.target.value)}
              value={newSubcategoryCategoryId}
            >
              {categories.length === 0 ? <option value="">No categories yet</option> : null}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="finance-field finance-field--full">
            <span>New subcategory</span>
            <input
              name="newSubcategory"
              onChange={(event) => setNewSubcategoryName(event.target.value)}
              type="text"
              value={newSubcategoryName}
            />
          </label>

          <button className="secondary-button finance-form__submit" type="submit">
            Add subcategory
          </button>
        </form>

        {formError ? <p className="finance-message finance-message--error">{formError}</p> : null}
        {errorMessage ? <p className="finance-message finance-message--error">{errorMessage}</p> : null}
      </section>

      <section className="finance-panel">
        <div className="finance-panel__heading">
          <div>
            <p className="finance-panel__eyebrow">Current structure</p>
            <h2>Categories and subcategories</h2>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="finance-empty-state">
            Create at least one category before adding transactions or subcategories.
          </p>
        ) : (
          <div className="finance-list">
            {categories.map((category) => {
              const categorySubcategories = getSubcategoriesForCategory(subcategories, category.id);
              const transactionCount = transactions.filter(
                (transaction) => transaction.categoryId === category.id,
              ).length;

              return (
                <article className="category-card" key={category.id}>
                  <div className="category-card__header">
                    <div>
                      <p className="category-card__eyebrow">{transactionCount} transactions</p>
                      {editingCategoryId === category.id ? (
                        <form
                          className="category-card__edit-form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void onUpdateCategory(category.id, editingCategoryName)
                              .then(() => {
                                setEditingCategoryId(null);
                                setEditingCategoryName('');
                              })
                              .catch((error) => {
                                setFormError(
                                  error instanceof Error
                                    ? error.message
                                    : 'Unable to update the category.',
                                );
                              });
                          }}
                        >
                          <input
                            onChange={(event) => setEditingCategoryName(event.target.value)}
                            type="text"
                            value={editingCategoryName}
                          />
                          <button className="secondary-button" type="submit">
                            Save
                          </button>
                        </form>
                      ) : (
                        <h3>{category.name}</h3>
                      )}
                    </div>

                    <div className="transaction-card__actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setEditingCategoryName(category.name);
                        }}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="secondary-button secondary-button--danger"
                        onClick={() => void onDeleteCategory(category.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {categorySubcategories.length === 0 ? (
                    <p className="category-card__subcopy">No subcategories yet.</p>
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
                                })
                                  .then(() => {
                                    setEditingSubcategoryId(null);
                                    setEditingSubcategoryName('');
                                    setEditingSubcategoryCategoryId('');
                                  })
                                  .catch((error) => {
                                    setFormError(
                                      error instanceof Error
                                        ? error.message
                                        : 'Unable to update the subcategory.',
                                    );
                                  });
                              }}
                            >
                              <input
                                onChange={(event) => setEditingSubcategoryName(event.target.value)}
                                type="text"
                                value={editingSubcategoryName}
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
                                Save
                              </button>
                            </form>
                          ) : (
                            <>
                              <span>{subcategory.name}</span>
                              <div className="subcategory-chip__actions">
                                <button
                                  className="subcategory-chip__button"
                                  onClick={() => {
                                    setEditingSubcategoryId(subcategory.id);
                                    setEditingSubcategoryName(subcategory.name);
                                    setEditingSubcategoryCategoryId(subcategory.categoryId);
                                  }}
                                  type="button"
                                >
                                  Edit
                                </button>
                                <button
                                  className="subcategory-chip__button"
                                  onClick={() => void onDeleteSubcategory(subcategory.id)}
                                  type="button"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

import { createLocalPreviewFinanceService } from './localPreviewFinanceService';

describe('localPreviewFinanceService', () => {
  it('seeds a preview workspace on first load', async () => {
    const service = createLocalPreviewFinanceService('user-1');

    const workspace = await service.getWorkspace();

    expect(workspace.categories.length).toBeGreaterThan(0);
    expect(workspace.transactions.length).toBeGreaterThan(0);
    expect(workspace.budgets.length).toBeGreaterThan(0);
    expect(workspace.budgetOverrides.length).toBeGreaterThan(0);
  });

  it('prevents duplicate category names', async () => {
    const service = createLocalPreviewFinanceService('user-1');

    await expect(service.createCategory({ name: 'Housing' })).rejects.toThrow(
      'Category names must be unique.',
    );
  });

  it('rejects transactions when the subcategory does not belong to the chosen category', async () => {
    const service = createLocalPreviewFinanceService('user-1');

    await expect(
      service.createTransaction({
        amount: 40,
        type: 'expense',
        categoryId: 'category-transport',
        subcategoryId: 'subcategory-groceries',
        date: '2026-03-09',
        description: 'Invalid assignment',
      }),
    ).rejects.toThrow('The selected subcategory does not belong to the selected category.');
  });

  it('blocks category deletion while related transactions exist', async () => {
    const service = createLocalPreviewFinanceService('user-1');

    await expect(service.deleteCategory('category-housing')).rejects.toThrow(
      'Delete subcategories before removing this category.',
    );
  });

  it('creates, updates, and deletes a transaction', async () => {
    const service = createLocalPreviewFinanceService('user-1');

    const createdTransaction = await service.createTransaction({
      amount: 55,
      type: 'expense',
      categoryId: 'category-food',
      subcategoryId: 'subcategory-restaurants',
      date: '2026-03-11',
      description: 'Lunch',
    });

    expect(createdTransaction.description).toBe('Lunch');

    const updatedTransaction = await service.updateTransaction(createdTransaction.id, {
      amount: 60,
      type: 'expense',
      categoryId: 'category-food',
      subcategoryId: 'subcategory-restaurants',
      date: '2026-03-11',
      description: 'Team lunch',
    });

    expect(updatedTransaction.description).toBe('Team lunch');

    await service.deleteTransaction(createdTransaction.id);

    const workspace = await service.getWorkspace();
    expect(workspace.transactions.find((item) => item.id === createdTransaction.id)).toBeUndefined();
  });

  it('creates, updates, and deletes a budget', async () => {
    const service = createLocalPreviewFinanceService('user-1');

    const createdBudget = await service.createBudget({
      categoryId: 'category-transport',
      subcategoryId: 'subcategory-transit',
      amount: 90,
    });

    expect(createdBudget.amount).toBe(90);

    const updatedBudget = await service.updateBudget(createdBudget.id, {
      categoryId: 'category-transport',
      subcategoryId: 'subcategory-transit',
      amount: 110,
    });

    expect(updatedBudget.amount).toBe(110);

    await service.deleteBudget(createdBudget.id);

    const workspace = await service.getWorkspace();
    expect(workspace.budgets.find((item) => item.id === createdBudget.id)).toBeUndefined();
  });

  it('prevents duplicate default budgets for the same scope', async () => {
    const service = createLocalPreviewFinanceService('user-1');

    await expect(
      service.createBudget({
        categoryId: 'category-housing',
        subcategoryId: null,
        amount: 999,
      }),
    ).rejects.toThrow('A default budget already exists for this scope.');
  });

  it('creates, updates, and deletes a monthly override', async () => {
    const service = createLocalPreviewFinanceService('user-1');

    const createdBudgetOverride = await service.createBudgetOverride({
      categoryId: 'category-transport',
      subcategoryId: null,
      month: '2026-04',
      amount: 120,
    });

    expect(createdBudgetOverride.amount).toBe(120);

    const updatedBudgetOverride = await service.updateBudgetOverride(createdBudgetOverride.id, {
      categoryId: 'category-transport',
      subcategoryId: null,
      month: '2026-04',
      amount: 140,
    });

    expect(updatedBudgetOverride.amount).toBe(140);

    await service.deleteBudgetOverride(createdBudgetOverride.id);

    const workspace = await service.getWorkspace();
    expect(
      workspace.budgetOverrides.find((item) => item.id === createdBudgetOverride.id),
    ).toBeUndefined();
  });

  it('requires a matching default budget before creating an override', async () => {
    const service = createLocalPreviewFinanceService('user-1');

    await expect(
      service.createBudgetOverride({
        categoryId: 'category-salary',
        subcategoryId: null,
        month: '2026-04',
        amount: 7000,
      }),
    ).rejects.toThrow('Create the default budget before adding a monthly override.');
  });

  it('prevents duplicate monthly overrides for the same scope', async () => {
    const service = createLocalPreviewFinanceService('user-1');

    await expect(
      service.createBudgetOverride({
        categoryId: 'category-food',
        subcategoryId: 'subcategory-restaurants',
        month: '2026-03',
        amount: 350,
      }),
    ).rejects.toThrow('A monthly override already exists for this scope.');
  });
});

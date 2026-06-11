import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { getDefaultDisplayPreferences } from '../../../shared/preferences/displayPreferences';
import { DisplayPreferencesContext } from '../../settings/displayPreferencesContextValue';
import { BudgetHighlights } from './BudgetHighlights';

function renderBudgetHighlights() {
  return render(
    <MemoryRouter>
      <DisplayPreferencesContext.Provider
        value={{
          preferences: getDefaultDisplayPreferences(),
          currencyOptions: [],
          localeOptions: [],
          updatePreferences: vi.fn(),
          resetPreferences: vi.fn(),
        }}
      >
        <BudgetHighlights
          cards={[
            {
              id: 'category-food',
              name: 'Food',
              icon: null,
              shortLabel: 'FO',
              defaultBudget: 500,
              effectiveBudget: 500,
              spent: 200,
              reserved: 100,
              todayAvailableToSpend: 20,
              overrideAmount: null,
              isOverridden: false,
            },
          ]}
          month="2026-03"
          onSelectCategory={vi.fn()}
        />
      </DisplayPreferencesContext.Provider>
    </MemoryRouter>,
  );
}

describe('BudgetHighlights', () => {
  it('splits category progress between spent and forecasted amounts', () => {
    const { container } = renderBudgetHighlights();
    const spentFill = container.querySelector<HTMLElement>('.budget-card__fill--spent');
    const forecastFill = container.querySelector<HTMLElement>('.budget-card__fill--forecast');

    expect(screen.getByRole('progressbar', { name: /food budget usage/i })).toBeInTheDocument();
    if (!spentFill || !forecastFill) {
      throw new Error('Expected spent and forecast progress segments to render.');
    }

    expect(spentFill).toHaveStyle({
      width: '40%',
    });
    expect(forecastFill).toHaveStyle({
      width: '20%',
    });
  });
});

import { useEffect, useState, type FormEvent } from 'react';

import { FinancePageHeader } from '../../finance/components/FinancePageHeader';
import { getCurrentMonthKey } from '../../../shared/lib/date/months';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { useDisplayPreferences } from '../useDisplayPreferences';

type SaveState = 'idle' | 'saved';

export function SettingsPage() {
  const { currencyOptions, localeOptions, preferences, resetPreferences, updatePreferences } =
    useDisplayPreferences();
  const [draftPreferences, setDraftPreferences] = useState(preferences);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    setDraftPreferences(preferences);
  }, [preferences]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updatePreferences(draftPreferences);
    setSaveState('saved');
  }

  function handleReset() {
    resetPreferences();
    setSaveState('saved');
  }

  return (
    <div className="finance-page">
      <FinancePageHeader
        description="Control how amounts and month labels are shown across the app. These preferences are saved for the current signed-in account on this device."
        eyebrow="Workspace"
        title="Settings"
      />

      <div className="finance-grid">
        <section className="finance-panel">
          <div className="finance-panel__heading">
            <div>
              <p className="finance-panel__eyebrow">Display preferences</p>
              <h2>Currency and locale</h2>
            </div>
          </div>

          <form className="finance-form" onSubmit={handleSubmit}>
            <label className="finance-field">
              <span>Default currency</span>
              <select
                name="displayCurrency"
                onChange={(event) => {
                  setDraftPreferences((currentPreferences) => ({
                    ...currentPreferences,
                    currency: event.target.value,
                  }));
                  setSaveState('idle');
                }}
                value={draftPreferences.currency}
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="finance-field">
              <span>Default locale</span>
              <select
                name="displayLocale"
                onChange={(event) => {
                  setDraftPreferences((currentPreferences) => ({
                    ...currentPreferences,
                    locale: event.target.value,
                  }));
                  setSaveState('idle');
                }}
                value={draftPreferences.locale}
              >
                {localeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button className="primary-button finance-form__submit" type="submit">
              Save display preferences
            </button>
            <button
              className="secondary-button finance-form__submit"
              onClick={handleReset}
              type="button"
            >
              Reset to app defaults
            </button>
          </form>

          {saveState === 'saved' ? (
            <p className="finance-message">Display preferences saved.</p>
          ) : (
            <p className="finance-empty-state">
              Changes apply immediately after you save them.
            </p>
          )}
        </section>

        <section className="finance-panel">
          <div className="finance-panel__heading">
            <div>
              <p className="finance-panel__eyebrow">Live preview</p>
              <h2>How your workspace will look</h2>
            </div>
          </div>

          <div className="settings-preview-grid">
            <article className="settings-preview-card">
              <span className="finance-summary-card__label">Amount preview</span>
              <strong>
                {formatCurrency(12450.75, {
                  currency: draftPreferences.currency,
                  locale: draftPreferences.locale,
                })}
              </strong>
            </article>
            <article className="settings-preview-card">
              <span className="finance-summary-card__label">Month preview</span>
              <strong>{formatMonthLabel(getCurrentMonthKey(), draftPreferences.locale)}</strong>
            </article>
          </div>

          <p className="settings-note">
            The current implementation stores these preferences in your browser for the signed-in
            account. If you use another device, you will need to set them again there.
          </p>
        </section>
      </div>
    </div>
  );
}

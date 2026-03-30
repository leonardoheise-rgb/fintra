import { useEffect, useState, type FormEvent } from 'react';

import { FinancePageHeader } from '../../finance/components/FinancePageHeader';
import { CategoriesSummaryCard } from '../../finance/components/CategoriesSummaryCard';
import { getCurrentMonthKey } from '../../../shared/lib/date/months';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatDayOfMonthLabel } from '../../../shared/lib/formatters/dayOfMonth';
import { getDefaultDisplayPreferences, type DisplayPreferences } from '../../../shared/preferences/displayPreferences';
import { useAuth } from '../../auth/useAuth';
import { useDisplayPreferences } from '../useDisplayPreferences';

type SaveState = 'idle' | 'saved';
const monthStartDayOptions = Array.from({ length: 31 }, (_, index) => index + 1);

function areDisplayPreferencesEqual(
  leftPreferences: DisplayPreferences,
  rightPreferences: DisplayPreferences,
) {
  return (
    leftPreferences.currency === rightPreferences.currency &&
    leftPreferences.locale === rightPreferences.locale &&
    leftPreferences.monthStartDay === rightPreferences.monthStartDay
  );
}

export function SettingsPage() {
  const auth = useAuth();
  const { currencyOptions, localeOptions, preferences, resetPreferences, updatePreferences } =
    useDisplayPreferences();
  const [draftPreferences, setDraftPreferences] = useState(preferences);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const hasUnsavedChanges = !areDisplayPreferencesEqual(draftPreferences, preferences);
  const canResetToDefaults = !areDisplayPreferencesEqual(
    preferences,
    getDefaultDisplayPreferences(),
  );

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
        description="Shape how the app reads day to day, from your preferred currency to the day your monthly cycle begins."
        eyebrow="Workspace"
        title="Settings"
      />

      <section className="finance-summary-grid" aria-label="Settings summary">
        <CategoriesSummaryCard label="Default currency" value={preferences.currency} />
        <CategoriesSummaryCard label="Default locale" value={preferences.locale} />
        <CategoriesSummaryCard
          label="Month starts on"
          value={formatDayOfMonthLabel(preferences.monthStartDay)}
        />
      </section>

      <div className="finance-grid">
        <section className="finance-panel">
          <div className="finance-panel__heading">
            <div>
              <p className="finance-panel__eyebrow">Display preferences</p>
              <h2>Currency, locale, and monthly cycle</h2>
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

            <label className="finance-field">
              <span>Month starts on</span>
              <select
                name="monthStartDay"
                onChange={(event) => {
                  setDraftPreferences((currentPreferences) => ({
                    ...currentPreferences,
                    monthStartDay: Number(event.target.value),
                  }));
                  setSaveState('idle');
                }}
                value={String(draftPreferences.monthStartDay)}
              >
                {monthStartDayOptions.map((day) => (
                  <option key={day} value={day}>
                    {formatDayOfMonthLabel(day)}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="primary-button finance-form__submit"
              disabled={!hasUnsavedChanges}
              type="submit"
            >
              Save display preferences
            </button>
            <button
              className="secondary-button finance-form__submit"
              disabled={!canResetToDefaults}
              onClick={handleReset}
              type="button"
            >
              Reset to app defaults
            </button>
          </form>

          {saveState === 'saved' ? (
            <p aria-live="polite" className="finance-message" role="status">
              Display preferences saved.
            </p>
          ) : hasUnsavedChanges ? (
            <p aria-live="polite" className="finance-message" role="status">
              You have unsaved display preference changes.
            </p>
          ) : (
            <p aria-live="polite" className="finance-empty-state" role="status">
              Changes apply immediately after you save them.
            </p>
          )}
        </section>

        <section className="finance-panel">
          <div className="finance-panel__heading">
            <div>
              <p className="finance-panel__eyebrow">Preview</p>
              <h2>How your workspace will read</h2>
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
            <article className="settings-preview-card">
              <span className="finance-summary-card__label">Monthly cycle</span>
              <strong>Starts on the {formatDayOfMonthLabel(draftPreferences.monthStartDay)}</strong>
            </article>
          </div>

          <p className="settings-note">
            These choices shape how totals and month-based views feel throughout the app.
          </p>
        </section>
      </div>

      <details className="finance-panel settings-support-panel">
        <summary className="settings-support-summary">Support details</summary>

        <div className="settings-preview-grid">
          <article className="settings-preview-card">
            <span className="finance-summary-card__label">Signed-in account</span>
            <strong>{auth.user?.email ?? 'Not available'}</strong>
          </article>
          <article className="settings-preview-card">
            <span className="finance-summary-card__label">Data availability</span>
            <strong>
              {auth.mode === 'supabase'
                ? 'Available whenever you sign in'
                : 'Stored on this device for now'}
            </strong>
          </article>
        </div>

        <p className="settings-note">
          Open this area when you need a quick support-oriented view of how this workspace is
          currently behaving.
        </p>
      </details>
    </div>
  );
}

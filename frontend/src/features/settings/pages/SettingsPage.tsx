import { useEffect, useState, type FormEvent } from 'react';

import { translateAppText } from '../../../shared/i18n/appText';
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
        description={translateAppText('settings.description')}
        eyebrow={translateAppText('settings.eyebrow')}
        title={translateAppText('settings.title')}
      />

      <section className="finance-summary-grid" aria-label={translateAppText('settings.summary')}>
        <CategoriesSummaryCard label={translateAppText('settings.defaultCurrency')} value={preferences.currency} />
        <CategoriesSummaryCard label={translateAppText('settings.defaultLocale')} value={preferences.locale} />
        <CategoriesSummaryCard
          label={translateAppText('settings.monthStartsOn')}
          value={formatDayOfMonthLabel(preferences.monthStartDay)}
        />
      </section>

      <div className="finance-grid">
        <section className="finance-panel">
          <div className="finance-panel__heading">
            <div>
              <p className="finance-panel__eyebrow">{translateAppText('settings.preferencesEyebrow')}</p>
              <h2>{translateAppText('settings.preferencesHeading')}</h2>
            </div>
          </div>

          <form className="finance-form" onSubmit={handleSubmit}>
            <label className="finance-field">
              <span>{translateAppText('settings.defaultCurrency')}</span>
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
                    {translateAppText(`settings.currencyOption.${option.value}`) || option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="finance-field">
              <span>{translateAppText('settings.defaultLocale')}</span>
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
                    {translateAppText(`settings.localeOption.${option.value}`) || option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="finance-field">
              <span>{translateAppText('settings.monthStartsOn')}</span>
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
                    {formatDayOfMonthLabel(day, draftPreferences.locale)}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="primary-button finance-form__submit"
              disabled={!hasUnsavedChanges}
              type="submit"
            >
              {translateAppText('settings.save')}
            </button>
            <button
              className="secondary-button finance-form__submit"
              disabled={!canResetToDefaults}
              onClick={handleReset}
              type="button"
            >
              {translateAppText('settings.reset')}
            </button>
          </form>

          {saveState === 'saved' ? (
            <p aria-live="polite" className="finance-message" role="status">
              {translateAppText('settings.saved')}
            </p>
          ) : hasUnsavedChanges ? (
            <p aria-live="polite" className="finance-message" role="status">
              {translateAppText('settings.unsaved')}
            </p>
          ) : (
            <p aria-live="polite" className="finance-empty-state" role="status">
              {translateAppText('settings.appliesImmediately')}
            </p>
          )}
        </section>

        <section className="finance-panel">
          <div className="finance-panel__heading">
            <div>
              <p className="finance-panel__eyebrow">{translateAppText('settings.previewEyebrow')}</p>
              <h2>{translateAppText('settings.previewHeading')}</h2>
            </div>
          </div>

          <div className="settings-preview-grid">
            <article className="settings-preview-card">
              <span className="finance-summary-card__label">{translateAppText('settings.amountPreview')}</span>
              <strong>
                {formatCurrency(12450.75, {
                  currency: draftPreferences.currency,
                  locale: draftPreferences.locale,
                })}
              </strong>
            </article>
            <article className="settings-preview-card">
              <span className="finance-summary-card__label">{translateAppText('settings.monthPreview')}</span>
              <strong>
                {formatMonthLabel(
                  getCurrentMonthKey(new Date(), draftPreferences.monthStartDay),
                  draftPreferences.locale,
                )}
              </strong>
            </article>
            <article className="settings-preview-card">
              <span className="finance-summary-card__label">{translateAppText('settings.monthlyCycle')}</span>
              <strong>
                {translateAppText('settings.startsOnDay', {
                  day: formatDayOfMonthLabel(draftPreferences.monthStartDay, draftPreferences.locale),
                })}
              </strong>
            </article>
          </div>

          <p className="settings-note">
            {translateAppText('settings.previewNote')}
          </p>
        </section>
      </div>

      <details className="finance-panel settings-support-panel">
        <summary className="settings-support-summary">{translateAppText('settings.supportDetails')}</summary>

        <div className="settings-preview-grid">
          <article className="settings-preview-card">
            <span className="finance-summary-card__label">{translateAppText('settings.signedInAccount')}</span>
            <strong>{auth.user?.email ?? translateAppText('settings.notAvailable')}</strong>
          </article>
          <article className="settings-preview-card">
            <span className="finance-summary-card__label">{translateAppText('settings.dataAvailability')}</span>
            <strong>{translateAppText('settings.availableOnSignIn')}</strong>
          </article>
        </div>

        <p className="settings-note">{translateAppText('settings.supportNote')}</p>
      </details>
    </div>
  );
}

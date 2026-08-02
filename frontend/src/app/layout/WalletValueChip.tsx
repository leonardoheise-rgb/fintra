import { useId, useState } from 'react';

import { translateAppText } from '../../shared/i18n/appText';
import { formatCurrency } from '../../shared/lib/formatters/currency';

type WalletValueChipProps = {
  amount: number;
};

export function WalletValueChip({ amount }: WalletValueChipProps) {
  const [isDefinitionVisible, setIsDefinitionVisible] = useState(false);
  const tooltipId = useId();
  const label = translateAppText('shell.walletValue');

  return (
    <div className="topbar__wallet-value">
      <button
        aria-controls={tooltipId}
        aria-describedby={isDefinitionVisible ? tooltipId : undefined}
        aria-expanded={isDefinitionVisible}
        aria-label={label}
        className="topbar__balance-chip"
        onClick={() => setIsDefinitionVisible((currentValue) => !currentValue)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsDefinitionVisible(false);
          }
        }}
        type="button"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
          <path d="M4 9h16" />
          <path d="M15.5 13h2.5" />
        </svg>
        <span className="topbar__balance-copy">
          <span>{label}</span>
          <strong>{formatCurrency(amount)}</strong>
        </span>
      </button>

      {isDefinitionVisible ? (
        <p className="topbar__balance-tooltip" id={tooltipId} role="tooltip">
          {translateAppText('shell.walletValueDefinition')}
        </p>
      ) : null}
    </div>
  );
}

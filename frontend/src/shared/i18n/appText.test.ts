import { translateAppText } from './appText';

describe('translateAppText', () => {
  it('returns corrected portuguese strings without mojibake artifacts', () => {
    expect(translateAppText('settings.previewEyebrow', undefined, 'pt-BR')).toBe('Prévia');
    expect(translateAppText('transactions.actions', undefined, 'pt-BR')).toBe('Ações');
    expect(translateAppText('dashboard.totalNetPosition', undefined, 'pt-BR')).toBe(
      'Disponível no mês',
    );
    expect(translateAppText('nav.notifications', undefined, 'pt-BR')).toBe('Notificações');
  });
});

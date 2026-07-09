import { translateAppText } from './appText';

describe('translateAppText', () => {
  it('returns corrected portuguese strings without mojibake artifacts', () => {
    expect(translateAppText('settings.previewEyebrow', undefined, 'pt-BR')).toBe('Prévia');
    expect(translateAppText('transactions.actions', undefined, 'pt-BR')).toBe('Ações');
    expect(translateAppText('dashboard.totalNetPosition', undefined, 'pt-BR')).toBe(
      'Disponível no mês',
    );
    expect(translateAppText('nav.notifications', undefined, 'pt-BR')).toBe('Notificações');
    expect(translateAppText('transactions.operationReserve', undefined, 'pt-BR')).toBe(
      'Reservar',
    );
    expect(translateAppText('categories.icon', undefined, 'pt-BR')).toBe('Ícone');
  });

  it('returns translated transaction operation and icon labels', () => {
    expect(translateAppText('transactions.operationCenter', undefined, 'en-US')).toBe(
      'Operation center',
    );
    expect(translateAppText('transactions.operationModes', undefined, 'en-US')).toBe(
      'Transaction operation modes',
    );
    expect(translateAppText('transactions.operationLog', undefined, 'pt-BR')).toBe('Registrar');
    expect(translateAppText('categories.iconPlaceholder', undefined, 'pt-BR')).toBe('ex.: casa');
    expect(translateAppText('auth.workspaceHighlights', undefined, 'pt-BR')).toBe(
      'Destaques do espaço de trabalho',
    );
  });

  it('returns translated date-format and repaired table labels', () => {
    expect(translateAppText('settings.dateFormat', undefined, 'en-US')).toBe('Date format');
    expect(translateAppText('settings.dateFormat', undefined, 'pt-BR')).toBe('Formato de data');
    expect(translateAppText('settings.datePreview', undefined, 'pt-BR')).toBe('Prévia de data');
    expect(translateAppText('transactions.csvTableLabel', undefined, 'pt-BR')).toBe(
      'Visualização de tabela de transações',
    );
    expect(translateAppText('transactions.tableView', undefined, 'pt-BR')).toBe(
      'Visualização de tabela',
    );
    expect(translateAppText('budgets.formTabs', undefined, 'pt-BR')).toBe(
      'Formulários de orçamento',
    );
    expect(translateAppText('dashboard.budgetPosture', undefined, 'en-US')).toBe(
      'Budget status',
    );
  });
});

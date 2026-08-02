import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WalletValueChip } from './WalletValueChip';

describe('WalletValueChip', () => {
  it('shows its definition when clicked and closes it with Escape', async () => {
    const user = userEvent.setup();

    render(<WalletValueChip amount={1250} />);

    const trigger = screen.getByRole('button', { name: /wallet value/i });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      /income.*planned.*carry-over.*expenses.*reserved money/i,
    );

    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

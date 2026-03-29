import { render, screen } from '@testing-library/react';

import { App } from './App';

describe('App', () => {
  it('renders the dashboard hero title', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /wealth in motion/i })).toBeInTheDocument();
  });

  it('renders the primary call to action', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /configure monthly plan/i })).toBeInTheDocument();
  });
});

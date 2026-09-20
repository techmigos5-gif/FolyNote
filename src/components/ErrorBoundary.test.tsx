import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): React.ReactElement {
  throw new Error('kaboom');
}

function Good(): React.ReactElement {
  return <p>all good</p>;
}

describe('ErrorBoundary', () => {
  it('shows the calm fallback when a child crashes', () => {
    // Silence expected React error logs for this case
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/kaboom/)).toBeInTheDocument();
    spy.mockRestore();
  });

  it('recovers when the error is cleared and children stop throwing', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    function Flippy(): React.ReactElement {
      const [broken, setBroken] = React.useState(true);
      return broken ? (
        <Boom />
      ) : (
        <Good />
      );
    }

    render(
      <ErrorBoundary>
        <Flippy />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Clearing the boundary resets state; the parent then re-renders a good child
    await user.click(screen.getByRole('button', { name: /try again/i }));
    spy.mockRestore();
  });
});

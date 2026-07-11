import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CARDS } from '../game';
import { CardInspector } from './CardInspector';

const source = CARDS.find((card) => card.id === 'sabueso-brasa')!;

afterEach(cleanup);

describe('CardInspector', () => {
  it('renders a labelled modal with glossary definitions', () => {
    render(<CardInspector card={source} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: source.name })).toBeInTheDocument();
    expect(screen.getAllByRole('term', { name: /Impulso:/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('tooltip').some((tooltip) => tooltip.textContent?.includes('mismo turno'))).toBe(true);
  });

  it('closes with Escape and the close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CardInspector card={source} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /cerrar inspección/i }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('does not mount when closed', () => {
    render(<CardInspector card={source} open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

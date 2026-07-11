import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CARDS } from '../game';
import { Card } from './Card';

const source = CARDS.find((card) => card.id === 'sabueso-brasa')!;

afterEach(cleanup);

describe('Card', () => {
  it('supports selection and all inspection shortcuts', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onInspect = vi.fn();
    render(<Card card={source} onSelect={onSelect} onInspect={onInspect} playable />);

    const card = screen.getByRole('button', { name: /Sabueso de Brasa/i });
    await user.click(card);
    expect(onSelect).toHaveBeenCalledWith(source);

    fireEvent.keyDown(card, { key: 'i' });
    fireEvent.contextMenu(card);
    expect(onInspect).toHaveBeenCalledTimes(2);
    expect(onInspect).toHaveBeenLastCalledWith(source);
  });

  it('does not select a disabled card but keeps inspection available', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onInspect = vi.fn();
    render(<Card card={source} onSelect={onSelect} onInspect={onInspect} disabled />);

    const card = screen.getByRole('button', { name: /deshabilitada/i });
    await user.click(card);
    fireEvent.keyDown(card, { key: 'i' });

    expect(onSelect).not.toHaveBeenCalled();
    expect(onInspect).toHaveBeenCalledWith(source);
  });

  it('uses the SVG artwork first and keeps a generated placeholder fallback', () => {
    render(<Card card={source} />);
    const art = screen.getByAltText(source.art.alt);

    expect(art).toHaveAttribute('src', source.art.fallback);
    fireEvent.error(art);
    expect(art.getAttribute('src')).toContain(source.art.webp);
    fireEvent.error(art);
    expect(art.getAttribute('src')).toContain('data:image/svg+xml');
  });
});

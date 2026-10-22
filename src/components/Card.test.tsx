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

  it('prioriza el arte WebP final, con SVG y placeholder como reservas', () => {
    render(<Card card={source} />);
    const art = screen.getByAltText(source.art.alt);

    expect(art).toHaveAttribute('src', source.art.webp);
    fireEvent.error(art);
    expect(art.getAttribute('src')).toContain(source.art.fallback);
    fireEvent.error(art);
    expect(art.getAttribute('src')).toContain('data:image/svg+xml');
  });

  it('el movimiento reducido de la aplicación omite la inclinación y conserva la selección', () => {
    const onSelect = vi.fn();
    render(<Card card={source} size="hand" reducedMotion onSelect={onSelect} />);
    const card = screen.getByRole('button', { name: /Sabueso de Brasa/i });
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 140));
    fireEvent.pointerMove(card, { clientX: 85, clientY: 20 });
    expect(card.style.getPropertyValue('--tilt-x')).toBe('');
    expect(card.style.getPropertyValue('--tilt-y')).toBe('');
    fireEvent.click(card);
    expect(onSelect).toHaveBeenCalledWith(source);
  });
});

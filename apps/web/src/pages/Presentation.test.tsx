import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Presentation } from './Presentation';
import { demoSteps, demoTickMs, stepTicks } from '@/data/packetTracer';

// Test the presentation controller independently of React Flow's measured canvas.
vi.mock('@xyflow/react', () => ({
  ReactFlow: () => <div>Topology canvas</div>, Background: () => null, Controls: () => null,
  Handle: () => null, BaseEdge: () => null, getBezierPath: () => [''], Position: { Top: 'top', Bottom: 'bottom' },
}));
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('One-click presentation', () => {
  it('runs all stages, pauses, resumes, completes and replays without an API', () => {
    vi.useFakeTimers();
    render(<Presentation />);
    fireEvent.click(screen.getByRole('button', { name: 'Simulate' }));
    expect(screen.getByText(demoSteps[0].title)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByText(demoSteps[0].title)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    for (const step of demoSteps) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
      for (let i = 0; i < stepTicks(step); i++) act(() => vi.advanceTimersByTime(demoTickMs));
    }
    expect(screen.getByText('DEMONSTRATION COMPLETE')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Replay simulation' }));
    expect(screen.getByText(demoSteps[0].title)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByText('Your complete topology, ready to explain.')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('opens presentation mode and exits with Escape', () => {
    const { container } = render(<Presentation />);
    fireEvent.click(screen.getByRole('button', { name: 'Present' }));
    expect(container.firstChild).toHaveClass('presentation-wide');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(container.firstChild).not.toHaveClass('presentation-wide');
  });
});


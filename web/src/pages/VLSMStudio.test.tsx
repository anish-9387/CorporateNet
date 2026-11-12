import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VLSMStudio } from './VLSMStudio';

describe('IP addressing calculator', () => {
  it('distinguishes department allocation from the complete project and recalculates parent percentages', async () => {
    render(<VLSMStudio />);
    expect(await screen.findByText(/240 addresses \(47% of parent\)/)).toBeInTheDocument();
    expect(screen.getByText(/complete project also allocates/)).toHaveTextContent('204 of 512');
    fireEvent.change(screen.getByDisplayValue('10.10.0.0/23'), { target: { value: '10.10.0.0/22' } });
    expect(await screen.findByText(/752 addresses \(73% of parent\)/)).toBeInTheDocument();
  });
});

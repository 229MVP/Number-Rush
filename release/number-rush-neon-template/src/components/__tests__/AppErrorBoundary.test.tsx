import React, { useState } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppErrorBoundary } from '../../errors/AppErrorBoundary';

jest.mock('../../errors/errorReporter', () => ({
  reportError: jest.fn(),
}));

function CrashingChild({ shouldCrash }: { shouldCrash: boolean }) {
  if (shouldCrash) {
    throw new Error('test crash');
  }
  return <Text testID="child-recovered">Recovered</Text>;
}

function Harness() {
  const [attempt, setAttempt] = useState(0);
  return (
    <AppErrorBoundary onReset={() => setAttempt((n) => n + 1)}>
      <CrashingChild key={attempt} shouldCrash={attempt === 0} />
    </AppErrorBoundary>
  );
}

describe('AppErrorBoundary', () => {
  it('shows fallback and recovers on try again', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const view = await render(<Harness />);

    expect(view.getByTestId('error-boundary')).toBeTruthy();
    expect(view.getByText('SOMETHING WENT WRONG')).toBeTruthy();

    fireEvent.press(view.getByTestId('error-try-again'));

    await waitFor(() => {
      expect(view.getByTestId('child-recovered')).toBeTruthy();
    });
    expect(view.queryByTestId('error-boundary')).toBeNull();

    await view.unmount();
    consoleError.mockRestore();
  });
});

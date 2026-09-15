import { createContext, useContext, useState, type ReactNode } from 'react';

type SelectedMonth = { year: number; month: number; goToPreviousMonth: () => void; goToNextMonth: () => void };

const SelectedMonthContext = createContext<SelectedMonth | null>(null);

/**
 * Wraps the tab navigator so the dashboard, histórico, and orçamento tabs all read and change
 * the same "month being viewed" -- switching months on one tab must carry over when the user
 * taps into another, not reset it back to the current month.
 */
export function SelectedMonthProvider({ children }: { children: ReactNode }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  function goToPreviousMonth() {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
      return;
    }

    setMonth(month - 1);
  }

  function goToNextMonth() {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
      return;
    }

    setMonth(month + 1);
  }

  return <SelectedMonthContext.Provider value={{ year, month, goToPreviousMonth, goToNextMonth }}>{children}</SelectedMonthContext.Provider>;
}

export function useSelectedMonth(): SelectedMonth {
  const selectedMonth = useContext(SelectedMonthContext);
  if (selectedMonth === null) {
    throw new Error('useSelectedMonth must be used within a SelectedMonthProvider.');
  }

  return selectedMonth;
}

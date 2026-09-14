import { useState } from 'react';

export function useSelectedMonth() {
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

  return { year, month, goToPreviousMonth, goToNextMonth };
}

// This model has no functions left: the free-text date field it used to support (parseDateInput,
// todayAsBRDate) was replaced by the pick-date calendar screen, which always returns an
// already-valid ISO date -- no parsing needed. Left in place, excluded from tsc/jest via
// tsconfig.json/package.json, only because this sandbox has no working file-delete tool; delete
// this file and its .test.ts sibling outright once one is available.
export {};

# Cash Track

Mobile-first personal finance app: log income and expenses, tag them, track recurring transactions, set monthly budgets per tag and see where the money goes with a dashboard and history.

Built with **React Native, Expo and TypeScript**. The interface is in Brazilian Portuguese.

> Backend (.NET / C#, DDD, AWS Lambda): [cash-tracker-api](https://github.com/V1ctorBarbosa/cash-tracker-api)

## Highlights

- **Transactions** with tags and payment methods, plus **recurring transactions** and **monthly budgets per tag**.
- **Dashboard and history** by month or custom date range.
- **Feature-Sliced Design**: code organized by `app`, `pages`, `features`, `entities` and `shared` slices, each with a public API.
- **Render-focused components.** Derived data lives in plain `model/` functions next to each slice, unit-tested without rendering anything.
- **160+ tests** with Jest and React Native Testing Library.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Expo (React Native), Expo Router |
| Language | TypeScript |
| Server state | TanStack Query |
| Forms and validation | React Hook Form + Zod |
| Styling | NativeWind (Tailwind), one centralized theme |
| Animation | Reanimated |
| Auth | Google Sign-In + Firebase Auth, behind a project-defined `AuthGateway` port |
| Tests | Jest, React Native Testing Library |

**Dependency inversion on the frontend too:** pages and features talk to an `AuthGateway` interface, and a single Firebase adapter implements it.

## How it is built

Designed first in an [implementation document](https://github.com/V1ctorBarbosa/cash-tracker-api/blob/master/docs/cash-track-implementation.md), then developed with Claude Code in a workflow of small reviewed changes, tests with every change and Conventional Commits. The AI writes alongside me; the design decisions and the review are mine.

## Running locally

```bash
npm install
npx expo start
npm test
```

Google Sign-In needs a development build (`expo-dev-client`).

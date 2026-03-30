import { Outlet, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { AnalyticsPage } from '../features/analytics/pages/AnalyticsPage';
import { BudgetsPage } from '../features/budgets/pages/BudgetsPage';
import { PublicOnlyRoute } from '../features/auth/components/PublicOnlyRoute';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { SignInPage } from '../features/auth/pages/SignInPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { FinanceDataProvider } from '../features/finance/FinanceDataContext';
import { CategoriesPage } from '../features/finance/pages/CategoriesPage';
import { TransactionsPage } from '../features/finance/pages/TransactionsPage';
import { AppLayout } from './layout/AppLayout';

function AppShell() {
  return (
    <FinanceDataProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </FinanceDataProvider>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

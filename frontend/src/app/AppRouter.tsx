import { Outlet, Route, Routes } from 'react-router-dom';

import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { AppLayout } from './layout/AppLayout';

function AppShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

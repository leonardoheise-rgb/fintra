import { BudgetHighlights } from '../components/BudgetHighlights';
import { HeroSummary } from '../components/HeroSummary';
import { InsightsPanel } from '../components/InsightsPanel';
import { dashboardSnapshot } from '../dashboard.data';

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <HeroSummary snapshot={dashboardSnapshot} />
      <BudgetHighlights cards={dashboardSnapshot.cards} />
      <InsightsPanel insight={dashboardSnapshot.insight} />
    </div>
  );
}

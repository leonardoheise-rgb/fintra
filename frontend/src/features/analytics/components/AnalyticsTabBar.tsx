type AnalyticsTab = 'overview' | 'categories';

type AnalyticsTabBarProps = {
  activeTab: AnalyticsTab;
  onChange(tab: AnalyticsTab): void;
};

export function AnalyticsTabBar({ activeTab, onChange }: AnalyticsTabBarProps) {
  return (
    <div className="analytics-tabbar" role="tablist" aria-label="Analytics views">
      {[
        { id: 'overview' as const, label: 'Overview' },
        { id: 'categories' as const, label: 'Categories' },
      ].map((tab) => (
        <button
          aria-selected={activeTab === tab.id}
          className={`analytics-tabbar__button${
            activeTab === tab.id ? ' analytics-tabbar__button--active' : ''
          }`}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

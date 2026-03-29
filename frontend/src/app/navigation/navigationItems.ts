export const navigationItems = [
  {
    label: 'Dashboard',
    shortLabel: 'DB',
    description: 'Monthly balance, pacing, and budget posture.',
    href: '/',
    isEnabled: true,
  },
  {
    label: 'Transactions',
    shortLabel: 'TX',
    description: 'Create, edit, and delete income and expense records.',
    href: '/transactions',
    isEnabled: true,
  },
  {
    label: 'Categories',
    shortLabel: 'CT',
    description: 'Manage categories and subcategories for transaction routing.',
    href: '/categories',
    isEnabled: true,
  },
  {
    label: 'Budgets',
    shortLabel: 'BG',
    description: 'Default plans and override workflows are queued.',
    href: '/budgets',
    isEnabled: false,
  },
  {
    label: 'Analytics',
    shortLabel: 'AN',
    description: 'Historical insights and trend surfaces are reserved.',
    href: '/analytics',
    isEnabled: false,
  },
];

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
    description: 'Define defaults and monthly overrides by category and subcategory.',
    href: '/budgets',
    isEnabled: true,
  },
  {
    label: 'Analytics',
    shortLabel: 'AN',
    description: 'Review historical trends, savings rate, and category drift.',
    href: '/analytics',
    isEnabled: true,
  },
];

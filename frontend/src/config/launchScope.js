// Centralized launch scope / feature gating for the frontend.
// Goal: ship a tight MVP "all-in-one dashboard" without exposing half-built modules by default.

export const LAUNCH_MODE = import.meta.env.VITE_LAUNCH_MODE || 'mvp'; // 'mvp' | 'full'

// If a feature is not enabled in MVP, it can still be accessed in a "Labs preview"
// by appending `?labs=1` to the URL.
export const LABS_PREVIEW_QUERY_KEY = 'labs';

export const FEATURES = {
  dashboard: {
    title: 'Dashboard',
    enabledInMvp: true,
  },
  calendar: {
    title: 'Calendar',
    enabledInMvp: true,
  },
  transactions: {
    title: 'Transactions',
    enabledInMvp: true,
  },
  loans: {
    title: 'Loans',
    enabledInMvp: true,
  },
  library: {
    title: 'Library',
    enabledInMvp: true,
  },
  notes: {
    title: 'Notes',
    enabledInMvp: true,
    mvpNote: 'Notes are stored locally in your browser during beta.',
  },
  profile: {
    title: 'Profile',
    enabledInMvp: true,
  },
  labs: {
    title: 'Labs',
    enabledInMvp: true,
  },

  // Finance suite (demo/partial)
  finances: {
    title: 'Finances',
    enabledInMvp: false,
    redirectTo: '/transactions',
    comingSoonDescription: 'The unified Finances dashboard is in Labs while we finalize budgeting + recurring logic.',
  },
  investments: {
    title: 'Investments',
    enabledInMvp: true,
  },
  bills: {
    title: 'Bills',
    enabledInMvp: false,
    comingSoonDescription: 'Bills are in Labs preview while we add persistence + reminders.',
  },
  invoices: {
    title: 'Invoices',
    enabledInMvp: false,
    comingSoonDescription: 'Invoices are in Labs preview while PDF export + storage are implemented.',
  },
  budgets: {
    title: 'Budgets',
    enabledInMvp: false,
    comingSoonDescription: 'Budgets are in Labs preview while we connect them to transactions.',
  },
  financialStatement: {
    title: 'Financial Statement',
    enabledInMvp: false,
    comingSoonDescription: 'Statements are in Labs preview until they’re computed from real data.',
  },

  // Home / personal modules (demo)
  chores: {
    title: 'Chores',
    enabledInMvp: false,
    comingSoonDescription: 'Chores are in Labs preview while we add persistence + assignment/sharing.',
  },
  inventory: {
    title: 'Inventory',
    enabledInMvp: true,
  },
  habits: {
    title: 'Habits',
    enabledInMvp: false,
    comingSoonDescription: 'Habits are in Labs preview while we add persistence + analytics.',
  },
  goals: {
    title: 'Goals',
    enabledInMvp: false,
    comingSoonDescription: 'Goals are in Labs preview while we add persistence + dashboards.',
  },
  health: {
    title: 'Health & Fitness',
    enabledInMvp: false,
    comingSoonDescription: 'Health tracking is in Labs preview while we add logging + storage.',
  },
  mealPlans: {
    title: 'Meal Plans',
    enabledInMvp: false,
    comingSoonDescription: 'Meal planning is in Labs preview while we add persistence + grocery lists.',
  },

  // High-risk integrations
  email: {
    title: 'Email',
    enabledInMvp: false,
    comingSoonDescription: 'Gmail integration is paused for v1 due to verification/compliance scope.',
  },
  meet: {
    title: 'Google Meet',
    enabledInMvp: false,
    comingSoonDescription: 'Meet tools are in Labs preview after Calendar is stable.',
  },
  scheduling: {
    title: 'Scheduling',
    enabledInMvp: true,
    mvpNote: 'Create booking links and manage your availability like Calendly.',
  },
  forms: {
    title: 'Forms',
    enabledInMvp: true,
    mvpNote: 'Create custom forms and collect data from surveys and questionnaires.',
  },
  integrations: {
    title: 'Integrations',
    enabledInMvp: true,
    mvpNote: 'Connect your favorite apps and services to streamline your workflow.',
  },
  family: {
    title: 'Family',
    enabledInMvp: true,
    mvpNote: 'Manage your family members and relationships.',
  },
};

export function isFeatureEnabled(featureKey) {
  if (LAUNCH_MODE === 'full') return true;
  return FEATURES[featureKey]?.enabledInMvp === true;
}


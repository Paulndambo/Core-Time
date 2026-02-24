import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Finances from './pages/Finances';
import Transactions from './pages/Transactions';
import Chores from './pages/Chores';
import Notes from './pages/Notes';
import Calendar from './pages/Calendar';
import LoginPage from './pages/LoginPage';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import HabitTracker from './pages/HabitTracker';
import Goals from './pages/Goals';
import HealthFitness from './pages/HealthFitness';
import Email from './pages/Email';
import Meet from './pages/Meet';
import Library from './pages/Library';
import Investments from './pages/Investments';
import Loans from './pages/Loans';
import LoanDetails from './pages/LoanDetails';
import Bills from './pages/Bills';
import Invoices from './pages/Invoices';
import Budgets from './pages/Budgets';
import FinancialStatement from './pages/FinancialStatement';
import MealPlans from './pages/MealPlans';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import BookDetails from './pages/BookDetails';
import Labs from './pages/Labs';
import ComingSoon from './pages/ComingSoon';
import Scheduling from './pages/Scheduling';
import BookingPage from './pages/BookingPage';
import Forms from './pages/Forms';
import FormBuilder from './pages/FormBuilder';
import FormResponse from './pages/FormResponse';
import FormResponses from './pages/FormResponses';
import Integrations from './pages/Integrations';
import Family from './pages/Family';
import { FEATURES, isFeatureEnabled, LABS_PREVIEW_QUERY_KEY } from './config/launchScope';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const FeatureRoute = ({ feature, children }) => {
  const location = useLocation();
  const featureMeta = FEATURES[feature] || {};
  const labsPreview = new URLSearchParams(location.search).get(LABS_PREVIEW_QUERY_KEY) === '1';

  if (isFeatureEnabled(feature) || labsPreview) return children;

  if (featureMeta.redirectTo) {
    return <Navigate to={featureMeta.redirectTo} replace />;
  }

  return (
    <ComingSoon
      title={featureMeta.title || 'Coming soon'}
      description={featureMeta.comingSoonDescription}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        
        {/* Public Booking Pages */}
        <Route path="/book/:username" element={<BookingPage />} />
        <Route path="/book/:username/:eventId" element={<BookingPage />} />
        
        {/* Public Form Response Page */}
        <Route path="/forms/:formId/respond" element={<FormResponse />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<FeatureRoute feature="dashboard"><Dashboard /></FeatureRoute>} />
          <Route path="calendar" element={<FeatureRoute feature="calendar"><Calendar /></FeatureRoute>} />
          <Route path="transactions" element={<FeatureRoute feature="transactions"><Transactions /></FeatureRoute>} />
          <Route path="investments" element={<FeatureRoute feature="investments"><Investments /></FeatureRoute>} />
          <Route path="loans" element={<FeatureRoute feature="loans"><Loans /></FeatureRoute>} />
          <Route path="loans/:id" element={<FeatureRoute feature="loans"><LoanDetails /></FeatureRoute>} />
          <Route path="inventory" element={<FeatureRoute feature="inventory"><Inventory /></FeatureRoute>} />
          <Route path="library" element={<FeatureRoute feature="library"><Library /></FeatureRoute>} />
          <Route path="library/books/:id" element={<FeatureRoute feature="library"><BookDetails /></FeatureRoute>} />
          <Route path="notes" element={<FeatureRoute feature="notes"><Notes /></FeatureRoute>} />
          <Route path="profile" element={<FeatureRoute feature="profile"><Profile /></FeatureRoute>} />
          <Route path="labs" element={<FeatureRoute feature="labs"><Labs /></FeatureRoute>} />

          {/* Labs-only / gated modules */}
          <Route path="finances" element={<FeatureRoute feature="finances"><Finances /></FeatureRoute>} />
          <Route path="bills" element={<FeatureRoute feature="bills"><Bills /></FeatureRoute>} />
          <Route path="invoices" element={<FeatureRoute feature="invoices"><Invoices /></FeatureRoute>} />
          <Route path="budgets" element={<FeatureRoute feature="budgets"><Budgets /></FeatureRoute>} />
          <Route path="financial-statement" element={<FeatureRoute feature="financialStatement"><FinancialStatement /></FeatureRoute>} />
          <Route path="chores" element={<FeatureRoute feature="chores"><Chores /></FeatureRoute>} />
          <Route path="habits" element={<FeatureRoute feature="habits"><HabitTracker /></FeatureRoute>} />
          <Route path="goals" element={<FeatureRoute feature="goals"><Goals /></FeatureRoute>} />
          <Route path="health" element={<FeatureRoute feature="health"><HealthFitness /></FeatureRoute>} />
          <Route path="meal-plans" element={<FeatureRoute feature="mealPlans"><MealPlans /></FeatureRoute>} />
          <Route path="meet" element={<FeatureRoute feature="meet"><Meet /></FeatureRoute>} />
          <Route path="email" element={<FeatureRoute feature="email"><Email /></FeatureRoute>} />
          <Route path="scheduling" element={<FeatureRoute feature="scheduling"><Scheduling /></FeatureRoute>} />
          <Route path="forms" element={<FeatureRoute feature="forms"><Forms /></FeatureRoute>} />
          <Route path="forms/:formId/edit" element={<FeatureRoute feature="forms"><FormBuilder /></FeatureRoute>} />
          <Route path="forms/:formId/responses" element={<FeatureRoute feature="forms"><FormResponses /></FeatureRoute>} />
          <Route path="integrations" element={<FeatureRoute feature="integrations"><Integrations /></FeatureRoute>} />
          <Route path="family" element={<FeatureRoute feature="family"><Family /></FeatureRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

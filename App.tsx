import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './services/authContext';
import { LanguageProvider } from './services/languageContext';
import { ThemeProvider } from './services/themeContext';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { TestCatalog } from './pages/TestCatalog';
import { TestRunner } from './pages/TestRunner';
import { ResultView } from './pages/ResultView';
import { Auth } from './pages/Auth';
import { Plans } from './pages/Plans';
import { PaymentHistory } from './pages/PaymentHistory';
import { AffiliateEarnings } from './pages/AffiliateEarnings';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: React.PropsWithChildren) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/catalog" element={<TestCatalog />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/test/:id" 
        element={
          <ProtectedRoute>
            <TestRunner />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/result/:id" 
        element={
          <ProtectedRoute>
            <ResultView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/plans" 
        element={
          <ProtectedRoute>
            <Plans />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payment-history" 
        element={
          <ProtectedRoute>
            <PaymentHistory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/affiliate" 
        element={
          <ProtectedRoute>
            <AffiliateEarnings />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              {/* Auth route tanpa Layout */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Semua route lain menggunakan Layout */}
              <Route path="/*" element={
                <Layout>
                  <AppRoutes />
                </Layout>
              } />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;


import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from './pages/Auth';
import GraphAnalyzer from './components/GraphAnalyzer';
import Dashboard from './pages/Dashboard';
import AuthButton from './components/AuthButton';
import { Toaster } from 'sonner';
import { AnalyzerProvider } from './context/AnalyzerContext';
import LiveAnalysisPage from './pages/LiveAnalysis';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient();

// Componente para navegação que só aparece quando autenticado
const Navigation: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <nav className="bg-trader-panel border-b border-trader-border p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white">
          Graph Analyzer
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            to="/live-analysis" 
            className="text-trader-gray hover:text-white transition-colors"
          >
            Live Analysis
          </Link>
          <Link 
            to="/dashboard" 
            className="text-trader-gray hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

// Componente protegido que requer autenticação
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      console.log('User not authenticated, redirecting to auth...');
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-trader-dark flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return <>{children}</>;
};

// Componente para redirecionar usuários autenticados da página de auth
const AuthRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user) {
      console.log('User already authenticated, redirecting to home...');
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-trader-dark flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }
  
  if (user) {
    return null;
  }
  
  return <Auth />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnalyzerProvider>
          <Toaster />
          <div className="min-h-screen bg-trader-dark">
            <Navigation />
            
            <Routes>
              <Route path="/auth" element={<AuthRoute />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <GraphAnalyzer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/live-analysis" 
                element={
                  <ProtectedRoute>
                    <LiveAnalysisPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </AnalyzerProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

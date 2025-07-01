import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './lib/supabaseClient';
import { Auth } from './pages/Auth';
import { GraphAnalyzer } from './components/GraphAnalyzer';
import { Dashboard } from './pages/Dashboard';
import { AuthButton } from './components/AuthButton';
import { Toaster } from 'sonner';
import { AnalyzerProvider } from './context/AnalyzerContext';
import LiveAnalysisPage from './pages/LiveAnalysis';
import { useAuth } from './hooks/useAuth';

function App() {
  const { requireAuth } = useAuth();
  
  // Componente protegido que requer autenticação
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
      if (!user) {
        navigate('/auth');
      }
    }, [user, navigate]);
    
    if (!user) {
      return null;
    }
    
    return <>{children}</>;
  };

  return (
    <QueryClient>
      <BrowserRouter>
        <SessionContextProvider supabaseClient={supabase}>
          <AnalyzerProvider>
            <Toaster />
            <div className="min-h-screen bg-trader-dark">
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
              
              <Routes>
                <Route path="/auth" element={<Auth />} />
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
        </SessionContextProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;

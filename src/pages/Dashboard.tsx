import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import UserDashboard from '@/components/UserDashboard';
import AuthButton from '@/components/AuthButton';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-trader-dark flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-trader-dark">
      <header className="border-b border-trader-blue/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Analisador Gráfico</h1>
          <AuthButton />
        </div>
      </header>
      <UserDashboard />
    </div>
  );
};

export default Dashboard;

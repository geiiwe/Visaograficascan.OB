
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, User } from 'lucide-react';

const AuthButton = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-trader-gray text-sm">
          <User className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          size="sm"
          className="text-trader-gray hover:text-white"
        >
          Dashboard
        </Button>
        <Button
          onClick={signOut}
          variant="ghost"
          size="sm"
          className="text-trader-gray hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => navigate('/auth')}
      variant="ghost"
      size="sm"
      className="text-trader-gray hover:text-white"
    >
      <LogIn className="h-4 w-4 mr-1" />
      Entrar
    </Button>
  );
};

export default AuthButton;

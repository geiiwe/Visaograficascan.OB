
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const AuthButton = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Carregando...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">
          Olá, {user.email?.split('@')[0]}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-red-400 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => navigate('/auth')}
      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
    >
      <User className="w-4 h-4 mr-2" />
      Entrar
    </Button>
  );
};

export default AuthButton;

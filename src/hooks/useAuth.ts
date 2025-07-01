
import { useUser } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const user = useUser();
  const navigate = useNavigate();
  
  const requireAuth = () => {
    if (!user) {
      navigate('/auth');
      return false;
    }
    return true;
  };
  
  return {
    user,
    isAuthenticated: !!user,
    requireAuth
  };
};

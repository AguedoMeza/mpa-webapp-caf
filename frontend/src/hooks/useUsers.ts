import { useState, useEffect } from 'react';
import { userService, User } from '../services/user.service';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook para cargar y gestionar la lista de usuarios del directorio
 */
export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.listUsers();
      setUsers(response.users);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'Error al cargar usuarios';
      setError(errorMessage);
      console.error('Error en useUsers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refresh: loadUsers,
  };
};
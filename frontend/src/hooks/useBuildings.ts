import { useState, useEffect } from 'react';
import { buildingService, Building } from '../services/building.service';

interface UseBuildingsResult {
  buildings: Building[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personalizado para cargar la lista de buildings
 * Cachea los resultados para evitar llamadas innecesarias
 */
export const useBuildings = (): UseBuildingsResult => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si ya tenemos buildings en localStorage (cache simple)
      const cachedBuildings = localStorage.getItem('cached_buildings');
      const cacheTimestamp = localStorage.getItem('cached_buildings_timestamp');
      const cacheExpiry = 1000 * 60 * 30; // 30 minutos
      
      const now = Date.now();
      const isCacheValid = 
        cachedBuildings && 
        cacheTimestamp && 
        (now - parseInt(cacheTimestamp)) < cacheExpiry;

      if (isCacheValid) {
        // Usar cache
        setBuildings(JSON.parse(cachedBuildings));
        setLoading(false);
        return;
      }

      // Hacer llamada al API
      const data = await buildingService.listBuildings();
      setBuildings(data);
      
      // Guardar en cache
      localStorage.setItem('cached_buildings', JSON.stringify(data));
      localStorage.setItem('cached_buildings_timestamp', now.toString());
      
    } catch (err: any) {
      console.error('Error en useBuildings:', err);
      const errorMessage = 
        err.response?.data?.detail || 
        err.response?.data?.message || 
        err.message || 
        'Error al cargar la lista de buildings';
      setError(errorMessage);
      setBuildings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  return {
    buildings,
    loading,
    error,
    refetch: fetchBuildings,
  };
};
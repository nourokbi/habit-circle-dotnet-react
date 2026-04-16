import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useCircles() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchCircles = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/circle/my');
      // Sort: admin circles first, then member
      data.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return 0;
      });
      setCircles(data);
    } catch {
      setError('Could not load circles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCircles(); }, []);

  return { circles, loading, error, refetch: fetchCircles };
}

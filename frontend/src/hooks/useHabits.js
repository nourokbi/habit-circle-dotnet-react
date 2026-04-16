import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useHabits() {
  const [habits, setHabits]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/habit');
      // Sort: Daily first, then Weekly, Monthly, Yearly
      const order = { Daily: 0, Weekly: 1, Monthly: 2, Yearly: 3 };
      data.sort((a, b) => (order[a.frequencyType] ?? 4) - (order[b.frequencyType] ?? 4));
      setHabits(data);
    } catch {
      setError('Could not load habits.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHabits(); }, []);

  return { habits, loading, error, refetch: fetchHabits };
}

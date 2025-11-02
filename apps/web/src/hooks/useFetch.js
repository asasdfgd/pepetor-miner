import { useState, useEffect } from 'react';
import api from '../services/api';

export const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.get(endpoint);
        setData(result);
      } catch (err) {
        setError(err);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: () => {} };
};

export default useFetch;

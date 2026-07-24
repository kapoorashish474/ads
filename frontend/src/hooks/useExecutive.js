import { useEffect, useState } from 'react';
import { api } from '../api';

export function useExecutive(slug) {
  const [executive, setExecutive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .executive(slug)
      .then(setExecutive)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { executive, loading, error };
}

export function momentumTone(direction) {
  if (direction === 'up') return 'launch';
  if (direction === 'down') return 'critical';
  return 'partnership';
}

export function severityTone(severity) {
  return severity === 'critical' ? 'critical' : severity === 'high' ? 'launch' : 'partnership';
}

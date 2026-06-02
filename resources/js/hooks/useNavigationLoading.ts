import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export function useNavigationLoading() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    const removeStart = router.on('start', () => {
      timer = window.setTimeout(() => setLoading(true), 120);
    });
    const removeFinish = router.on('finish', () => {
      if (timer) {
        window.clearTimeout(timer);
      }
      setLoading(false);
    });

    return () => {
      removeStart();
      removeFinish();
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  return loading;
}

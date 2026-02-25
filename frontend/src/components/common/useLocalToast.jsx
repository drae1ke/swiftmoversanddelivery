import { useState, useCallback } from 'react';
import { nid } from '../../utils/utils';

export const useLocalToast = (defaultDuration = 3000) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(
    (msg, type = 'success') => {
      const id = nid();
      setToasts((t) => [...t, { id, msg, type }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, defaultDuration);
    },
    [defaultDuration],
  );

  return { toasts, toast };
};


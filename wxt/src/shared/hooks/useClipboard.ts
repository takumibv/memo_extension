import { useCallback, useState } from 'react';

export const useClipboard = () => {
  const [isSuccessCopy, setIsSuccessCopy] = useState(false);

  const copyClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsSuccessCopy(true);

      setTimeout(() => {
        setIsSuccessCopy(false);
      }, 1000);
    });
  }, []);

  return {
    isSuccessCopy,
    copyClipboard,
  };
};

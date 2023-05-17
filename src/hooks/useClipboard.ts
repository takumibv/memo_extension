import { useCallback, useState } from "react";

export const useClipboard = () => {
  // コピー成功アイコンの表示
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

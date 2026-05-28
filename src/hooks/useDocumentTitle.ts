import { useEffect } from 'react';

/** يضبط عنوان تبويب المتصفح ويستعيد السابق عند مغادرة الصفحة/المكوّن. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

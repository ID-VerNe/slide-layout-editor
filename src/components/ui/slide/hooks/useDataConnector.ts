import { useMemo } from 'react';
import { PageData } from '../../../../types';

/**
 * useDataConnector - 从 PageData 中提取指定字段的数据与 Overrides
 */
export const useDataConnector = (fieldKey: string, page: PageData) => {
  return useMemo(() => {
    const content = (page as any)[fieldKey];
    const overrides = page.styleOverrides?.[fieldKey] || {};
    const isVisible = page.visibility?.[fieldKey] !== false;

    return {
      content,
      overrides,
      isVisible,
    };
  }, [fieldKey, (page as any)[fieldKey], page.styleOverrides?.[fieldKey], page.visibility?.[fieldKey]]);
};

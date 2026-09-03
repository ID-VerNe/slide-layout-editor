import { useMemo } from 'react';
import { PageData } from '../../../../types';

export interface DataConnectorResult<T = any> {
  content: T;
  overrides: Record<string, any>;
  isVisible: boolean;
}

/** Extracts bound data, style overrides, and visibility status for a slide field */
export function useDataConnector<T = any>(
  fieldKey?: string,
  page?: PageData,
  fallbackContent?: T
): DataConnectorResult<T> {
  return useMemo(() => {
    if (!page) {
      return {
        content: fallbackContent as T,
        overrides: {},
        isVisible: true,
      };
    }

    const isVisible = fieldKey ? page.visibility?.[fieldKey] !== false : true;
    const pageVal = fieldKey ? (page as any)[fieldKey] : undefined;
    const content = pageVal !== undefined && pageVal !== null && pageVal !== '' ? pageVal : fallbackContent;
    const overrides = fieldKey ? (page.styleOverrides?.[fieldKey] || {}) : {};

    return {
      content: content as T,
      overrides,
      isVisible,
    };
  }, [
    fieldKey,
    page,
    fieldKey ? (page as any)?.[fieldKey] : undefined,
    fieldKey ? page?.styleOverrides?.[fieldKey] : undefined,
    fieldKey ? page?.visibility?.[fieldKey] : undefined,
    fallbackContent
  ]);
}

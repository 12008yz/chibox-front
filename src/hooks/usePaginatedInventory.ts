import { useState, useCallback, useEffect } from 'react';

export interface PaginatedInventoryState {
  items: any[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
}

export const usePaginatedInventory = (limit: number = 24) => {
  const [state, setState] = useState<PaginatedInventoryState>({
    items: [],
    page: 1,
    hasMore: true,
    isLoading: false,
  });

  const loadMore = useCallback(() => {
    if (!state.hasMore || state.isLoading) return;

    setState(prev => ({
      ...prev,
      page: prev.page + 1,
    }));
  }, [state.hasMore, state.isLoading]);

  const reset = useCallback(() => {
    setState({
      items: [],
      page: 1,
      hasMore: true,
      isLoading: false,
    });
  }, []);

  const appendItems = useCallback((newItems: any[], totalCount?: number) => {
    setState(prev => {
      const allItems = [...prev.items, ...newItems];
      const hasMore = totalCount ? allItems.length < totalCount : newItems.length === limit;

      return {
        ...prev,
        items: allItems,
        hasMore,
        isLoading: false,
      };
    });
  }, [limit]);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const replaceItems = useCallback((newItems: any[], totalCount?: number) => {
    setState({
      items: newItems,
      page: 1,
      hasMore: totalCount ? newItems.length < totalCount : newItems.length === limit,
      isLoading: false,
    });
  }, [limit]);

  return {
    ...state,
    loadMore,
    reset,
    appendItems,
    setLoading,
    replaceItems,
  };
};

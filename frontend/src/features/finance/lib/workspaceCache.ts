import type { FinanceWorkspace } from '../finance.types';

const cacheVersion = 1;

type CachedWorkspace = {
  version: number;
  workspace: FinanceWorkspace;
};

function getWorkspaceCacheKey(userId: string) {
  return `fintra.finance.workspace-cache.${userId}`;
}

export function readCachedWorkspace(userId: string): FinanceWorkspace | null {
  const rawValue = window.sessionStorage.getItem(getWorkspaceCacheKey(userId));

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<CachedWorkspace>;

    if (parsedValue.version !== cacheVersion || !parsedValue.workspace) {
      return null;
    }

    return parsedValue.workspace;
  } catch {
    return null;
  }
}

export function writeCachedWorkspace(userId: string, workspace: FinanceWorkspace) {
  const nextCache: CachedWorkspace = {
    version: cacheVersion,
    workspace,
  };

  window.sessionStorage.setItem(getWorkspaceCacheKey(userId), JSON.stringify(nextCache));
}

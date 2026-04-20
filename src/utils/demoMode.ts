/** Режим портфолио: без бэкенда/логина, моки API (сборка с VITE_DEMO_MODE=true). */
export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

let refreshHandler: (() => void) | null = null;

export function setStandingsRefreshHandler(handler: () => void) {
  refreshHandler = handler;
}

export function refreshStandingsHtml() {
  refreshHandler?.();
}

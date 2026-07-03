const endpoint = import.meta.env.VITE_OBSERVABILITY_ENDPOINT;

function report(payload) {
  const event = {
    ...payload,
    app: 'world-flags',
    url: window.location.href,
    userAgent: navigator.userAgent,
    at: new Date().toISOString(),
  };

  if (endpoint) {
    navigator.sendBeacon?.(endpoint, JSON.stringify(event))
      || fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      }).catch(() => {});
  }

  if (import.meta.env.DEV) {
    console.warn('[observability]', event);
  }
}

export function installObservability() {
  window.addEventListener('error', (event) => {
    report({
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    report({
      type: 'unhandledrejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
    });
  });
}

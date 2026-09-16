// Service Worker Registration for CO-ENGINEER PWA & Offline Support

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker successfully registered with scope:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[PWA] New content available; please refresh to update.');
                } else {
                  console.log('[PWA] Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          // Note: In sandboxed iframes without allow-same-origin or restricted protocols, SW registration can be gracefully ignored
          console.info('[PWA] Service Worker registration skipped or not supported in this container environment:', error?.message || error);
        });
    });
  }
}

export function unregisterServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (__IS_PRODUCTION__) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" });
      return;
    }

    // A service worker from an older local build can keep serving stale files.
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        void registration.unregister();
      }
    });
  });
}

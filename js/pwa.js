/* ==========================================================================
   PWA MOBILE INSTALL BANNER MANAGER
   Detects mobile devices (Android / iOS) and prompts top install banner
   ========================================================================== */

const PWAManager = (function () {
  "use strict";

  let deferredPrompt = null;
  let bannerTimeout = null;

  function isMobileDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTouchScreen = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth <= 768;
    return isMobileUA || (isTouchScreen && isSmallScreen);
  }

  function isAlreadyStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  function init() {
    // Only proceed if opened on a mobile device and NOT already installed
    if (!isMobileDevice() || isAlreadyStandalone()) {
      return;
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn("PWA Service Worker registration failed:", err);
      });
    }

    // Listen for native PWA beforeinstallprompt event (Android / Chrome)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showMobileInstallBanner();
    });

    // Fallback for mobile browsers where beforeinstallprompt doesn't fire immediately
    setTimeout(() => {
      const banner = document.getElementById('pwaMobileBanner');
      if (banner && banner.classList.contains('hidden') && !sessionStorage.getItem('pwa_banner_dismissed')) {
        showMobileInstallBanner();
      }
    }, 1200);
  }

  function showMobileInstallBanner() {
    const banner = document.getElementById('pwaMobileBanner');
    if (!banner) return;

    banner.classList.remove('hidden');

    // Auto-dissolve (auto hide) after 18 seconds as requested
    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = setTimeout(() => {
      dismissBanner();
    }, 18000);

    // Bind Install Button
    const installBtn = document.getElementById('pwaInstallBtn');
    const closeBtn = document.getElementById('pwaCloseBtn');

    if (installBtn) {
      installBtn.onclick = () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted PWA install');
            }
            deferredPrompt = null;
            dismissBanner();
          });
        } else {
          // General instructions for browsers / iOS
          alert("To install Number Jungle on your home screen:\n\n📱 Tap your browser menu (or Share button on iOS)\n➕ Select 'Add to Home Screen'");
          dismissBanner();
        }
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        sessionStorage.setItem('pwa_banner_dismissed', 'true');
        dismissBanner();
      };
    }
  }

  function dismissBanner() {
    const banner = document.getElementById('pwaMobileBanner');
    if (banner) {
      banner.style.animation = 'fadeOutBanner 0.4s ease forwards';
      setTimeout(() => {
        banner.classList.add('hidden');
        banner.style.animation = '';
      }, 400);
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    isMobileDevice,
    showMobileInstallBanner,
    dismissBanner
  };
})();

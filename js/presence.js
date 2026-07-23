/* ==========================================================================
   REAL-TIME GLOBAL PRESENCE TRACKER (Multi-Device & Multi-Tab Sync)
   ========================================================================== */

const PresenceEngine = (function () {
  "use strict";

  const SESSION_ID = 'sess_' + Math.random().toString(36).substring(2, 9);
  const PUBLIC_PRESENCE_URL = 'https://number-jungle-live-default-rtdb.firebaseio.com/presence';
  const LOCAL_STORAGE_KEY = 'nj_local_presence_registry';

  let updateCallback = null;

  function init(onUpdate) {
    updateCallback = onUpdate;

    sendHeartbeat();
    setInterval(sendHeartbeat, 3000);

    // Multi-tab BroadcastChannel listener
    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('nj_presence_channel');
        bc.onmessage = () => syncLocalAndNotify();
        bc.postMessage('ping');
      } catch (e) {
        console.warn("BroadcastChannel error:", e);
      }
    }

    // Storage event for multi-tab sync
    window.addEventListener('storage', (e) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        syncLocalAndNotify();
      }
    });

    // Clean up on tab unload
    window.addEventListener('beforeunload', leaveSession);
  }

  function sendHeartbeat() {
    const avatar = AvatarManager.getSelected();
    const now = Date.now();
    const payload = {
      id: SESSION_ID,
      avatarName: avatar.name,
      avatarEmoji: avatar.emoji,
      avatarId: avatar.id,
      ts: now
    };

    // 1. LocalStorage registry sync for tabs on same browser/device
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      let registry = raw ? JSON.parse(raw) : {};
      registry[SESSION_ID] = payload;

      for (const key in registry) {
        if (now - registry[key].ts > 7000) {
          delete registry[key];
        }
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(registry));
    } catch (e) {
      console.warn("Local presence save error:", e);
    }

    // 2. Global cloud presence sync via Firebase REST API for cross-device sync
    fetch(`${PUBLIC_PRESENCE_URL}/${SESSION_ID}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(() => fetchGlobalPresence())
      .catch(() => syncLocalAndNotify());
  }

  function fetchGlobalPresence() {
    fetch(`${PUBLIC_PRESENCE_URL}.json`)
      .then(res => res.json())
      .then(data => {
        if (!data) {
          syncLocalAndNotify();
          return;
        }
        const now = Date.now();
        const activeSessions = [];
        for (const key in data) {
          if (data[key] && (now - data[key].ts < 10000)) {
            activeSessions.push(data[key]);
          }
        }
        notifyUI(activeSessions);
      })
      .catch(() => syncLocalAndNotify());
  }

  function leaveSession() {
    try {
      fetch(`${PUBLIC_PRESENCE_URL}/${SESSION_ID}.json`, {
        method: 'DELETE',
        keepalive: true
      });
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        let registry = JSON.parse(raw);
        delete registry[SESSION_ID];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(registry));
      }
    } catch (e) {}
  }

  function syncLocalAndNotify() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const registry = JSON.parse(raw);
      const now = Date.now();
      const active = [];
      for (const key in registry) {
        if (now - registry[key].ts < 7000) {
          active.push(registry[key]);
        }
      }
      notifyUI(active);
    } catch (e) {}
  }

  function notifyUI(sessions) {
    if (!sessions || sessions.length === 0) {
      const selfAvatar = AvatarManager.getSelected();
      sessions = [{ avatarName: selfAvatar.name, avatarEmoji: selfAvatar.emoji, avatarId: selfAvatar.id }];
    }

    // Aggregate counts by avatar name & emoji
    const counts = {};
    sessions.forEach(s => {
      const key = `${s.avatarEmoji} ${s.avatarName}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const total = sessions.length;
    const uniqueKeys = Object.keys(counts);

    let displayText = "";
    if (uniqueKeys.length === 1) {
      const name = uniqueKeys[0];
      const qty = counts[name];
      displayText = `${qty} ${name} playing`;
    } else {
      const details = uniqueKeys.map(k => `${counts[k]} ${k}`).join(', ');
      displayText = `${total} Explorers playing (${details})`;
    }

    if (updateCallback) {
      updateCallback(displayText, total, sessions);
    }
  }

  return {
    init,
    sendHeartbeat
  };
})();

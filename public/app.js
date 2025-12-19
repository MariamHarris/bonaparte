(function () {
  'use strict';

  // Avoid re-defining if app.js is loaded twice.
  if (window.Bonaparte) return;

  // Toast notifications
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  function toast(message, type = 'info') {
    const div = document.createElement('div');
    div.className = `toast toast-${type}`;
    div.textContent = message;
    toastContainer.appendChild(div);
    setTimeout(() => {
      div.classList.add('show');
    }, 10);
    setTimeout(() => {
      div.classList.remove('show');
      setTimeout(() => div.remove(), 200);
    }, 3200);
  }

  async function withButton(btn, fn) {
    if (!btn) return fn();
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.classList.add('btn-loading');
    btn.textContent = '...';
    try {
      return await fn();
    } finally {
      btn.disabled = false;
      btn.classList.remove('btn-loading');
      btn.textContent = originalText;
    }
  }

  function apiBase() {
    // Nginx sirve el frontend en 8080; el API está en 3001.
    // Si cambias puertos, ajusta aquí.
    return 'http://127.0.0.1:3001';
  }

  function setToken(key, token) {
    localStorage.setItem(key, token);
  }

  function getToken(key) {
    return localStorage.getItem(key);
  }

  function clearToken(key) {
    localStorage.removeItem(key);
  }

  function decodeJwt(token) {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(payload)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  async function apiFetch(path, { method = 'GET', token, body } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${apiBase()}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const err = new Error((data && data.error) || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function showJson(targetEl, obj) {
    targetEl.textContent = JSON.stringify(obj, null, 2);
  }

  window.Bonaparte = {
    apiBase,
    apiFetch,
    setToken,
    getToken,
    clearToken,
    decodeJwt,
    el,
    showJson,
    toast,
    withButton,
  };
})();

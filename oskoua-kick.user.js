// ==UserScript==
// @name         Oskoua pour Kick
// @namespace    https://kick.com/o-skouate
// @version      1.0.2
// @description  Ajoute un bouton Oskoua dans le t'chat de kick.com/o-skouate pour lancer ses sketchs (!gifle, !boom, !danse…) et le faire parler (!tts) en un clic.
// @author       Oskouate
// @match        https://kick.com/o-skouate*
// @match        https://kick.com/popout/o-skouate/chat*
// @match        https://www.kick.com/o-skouate*
// @updateURL    https://raw.githubusercontent.com/xklwxklw979/oskoua-kick/main/oskoua-kick.user.js
// @downloadURL  https://raw.githubusercontent.com/xklwxklw979/oskoua-kick/main/oskoua-kick.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /* ═══════════ LES SKETCHS D'OSKOUA ═══════════ */
  const SKETCHS = [
    ['gifle', '👋', 'Gifle'], ['boom', '💣', 'Boom'], ['danse', '🕺', 'Danse'], ['love', '💚', 'Love'],
    ['rage', '😡', 'Rage'], ['dodo', '💤', 'Dodo'], ['bisou', '💋', 'Bisou'], ['prout', '💨', 'Prout'],
    ['peur', '👻', 'Peur'], ['malade', '🤢', 'Malade'], ['fete', '🎉', 'Fête'], ['gg', '👏', 'GG'],
    ['rip', '🪦', 'RIP'], ['pluie', '🌧️', 'Pluie'], ['banane', '🍌', 'Banane'], ['feu', '🔥', 'Feu'],
    ['froid', '🥶', 'Froid'], ['hypnose', '🌀', 'Hypnose'], ['vape', '🚭', 'Vape'],
  ];
  const COOLDOWN = 20;                                   // secondes, comme sur le live (une même commande)
  const ACC = '#53fc18';

  /* ═══════════ STYLE ═══════════ */
  const css = `
  #osk-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;border:none;cursor:pointer;
    background:transparent;padding:0;flex-shrink:0;transition:background .15s}
  #osk-btn:hover{background:rgba(255,255,255,.08)}
  #osk-btn svg{width:28px;height:20px;transition:transform .2s cubic-bezier(.2,1.6,.4,1)}
  #osk-btn:hover svg{transform:scale(1.15) rotate(-4deg)}
  #osk-btn.floating{position:fixed;right:18px;bottom:18px;width:52px;height:52px;border-radius:14px;background:#0d0d0d;border:3px solid ${ACC};z-index:99999;box-shadow:4px 4px 0 #000}
  #osk-btn.floating svg{width:38px;height:28px}
  #osk-panel{position:fixed;z-index:100000;width:330px;max-height:70vh;overflow:auto;background:#0f1210;border:3px solid ${ACC};border-radius:16px;
    box-shadow:6px 6px 0 #000;padding:12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#fff;display:none}
  #osk-panel.on{display:block;animation:oskIn .25s cubic-bezier(.2,1.6,.4,1)}
  @keyframes oskIn{from{transform:scale(.85) translateY(10px);opacity:0}}
  #osk-panel h3{margin:0 0 2px;font-size:15px;font-weight:900;letter-spacing:2px;display:flex;align-items:center;gap:8px}
  #osk-panel h3 svg{width:30px;height:21px}
  #osk-panel .sub{font-size:12px;color:#8a948b;margin-bottom:10px}
  #osk-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
  .osk-t{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 2px 6px;border-radius:10px;border:2px solid #232823;
    background:#151915;cursor:pointer;color:#fff;font-size:11.5px;font-weight:700;overflow:hidden;transition:transform .08s,border-color .15s}
  .osk-t:hover{border-color:${ACC};transform:translateY(-2px)}
  .osk-t:active{transform:scale(.95)}
  .osk-t .e{font-size:24px;line-height:1}
  .osk-t .cd{position:absolute;inset:0;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:${ACC}}
  .osk-t.wait{cursor:not-allowed;border-color:#232823;transform:none}
  .osk-t.wait .cd{display:flex}
  #osk-tts{display:flex;gap:6px;margin-top:10px}
  #osk-tts input{flex:1;min-width:0;background:#151915;border:2px solid #232823;border-radius:9px;color:#fff;padding:7px 9px;font-size:13px;font-weight:600;outline:none}
  #osk-tts input:focus{border-color:${ACC}}
  #osk-tts button,.osk-opt button{background:${ACC};color:#0d0d0d;border:none;border-radius:9px;font-weight:900;font-size:12px;padding:0 10px;cursor:pointer}
  .osk-opt{display:flex;align-items:center;justify-content:space-between;margin-top:10px;font-size:11.5px;color:#8a948b}
  .osk-opt label{display:flex;align-items:center;gap:6px;cursor:pointer}
  .osk-opt input{accent-color:${ACC}}
  #osk-toast{position:fixed;z-index:100001;left:50%;bottom:90px;transform:translateX(-50%);background:#0d0d0d;border:2px solid ${ACC};color:#fff;
    padding:7px 14px;border-radius:10px;font:700 13px system-ui,sans-serif;box-shadow:3px 3px 0 #000;display:none}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const FACE = `<svg viewBox="0 0 60 42"><rect x="2" y="2" width="56" height="38" rx="8" fill="${ACC}" stroke="#0d0d0d" stroke-width="3"/>
    <circle cx="20" cy="20" r="9" fill="#fff" stroke="#0d0d0d" stroke-width="2.6"/><circle cx="40" cy="20" r="9" fill="#fff" stroke="#0d0d0d" stroke-width="2.6"/>
    <circle cx="22" cy="19" r="3.6" fill="#0d0d0d"/><circle cx="42" cy="19" r="3.6" fill="#0d0d0d"/></svg>`;

  /* ═══════════ PRÉFÉRENCES ═══════════ */
  const pref = { get(k, d) { try { const v = localStorage.getItem('osk-' + k); return v === null ? d : v === '1'; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('osk-' + k, v ? '1' : '0'); } catch {} } };
  let autoSend = pref.get('send', true);

  /* ═══════════ TROUVER LE T'CHAT DE KICK ═══════════
     Kick change parfois son site : on cherche le champ de saisie de plusieurs façons. */
  function chatInput() {
    const sels = ['[data-testid="chat-input"]', '#chat-input', '[data-input="true"][contenteditable="true"]',
      '.chat-input [contenteditable="true"]', '[contenteditable="true"][role="textbox"]', 'div[contenteditable="true"]', 'textarea[placeholder]'];
    for (const s of sels) { const el = [...document.querySelectorAll(s)].find(e => e.offsetParent !== null); if (el) return el; }
    return null;
  }
  function sendButton(input) {
    const sels = ['[data-testid="send-chat-button"]', '#send-message-button', 'button[aria-label*="end" i]', 'button[aria-label*="nvoy" i]', 'button[type="submit"]'];
    for (const s of sels) { const b = document.querySelector(s); if (b && b.offsetParent !== null) return b; }
    // sinon : le dernier bouton à côté du champ
    const box = input && input.closest('form, [class*="chat"], [class*="input"]');
    if (box) { const bs = [...box.querySelectorAll('button')].filter(b => b.offsetParent !== null); if (bs.length) return bs[bs.length - 1]; }
    return null;
  }

  function toast(t) {
    let el = document.getElementById('osk-toast');
    if (!el) { el = document.createElement('div'); el.id = 'osk-toast'; document.body.appendChild(el); }
    el.textContent = t; el.style.display = 'block'; clearTimeout(el._t); el._t = setTimeout(() => { el.style.display = 'none'; }, 2200);
  }

  // écrit le texte dans le champ du t'chat (et l'envoie si l'option est cochée)
  async function sendToChat(text) {
    const input = chatInput();
    if (!input) {
      try { await navigator.clipboard.writeText(text); toast('Copié ! Colle-le dans le t\'chat'); } catch { toast('T\'chat introuvable : ' + text); }
      return false;
    }
    input.focus();
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      const set = Object.getOwnPropertyDescriptor(input.constructor.prototype, 'value').set;
      set.call(input, text); input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // éditeur riche de Kick : on vide puis on « tape » le texte comme un humain
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, text);
      // l'éditeur de Kick met le champ à jour un peu après : on attend avant de juger s'il faut un secours
      await new Promise(r => setTimeout(r, 80));
      if (!input.textContent.trim()) {                             // secours : on « colle » le texte
        const dt = new DataTransfer(); dt.setData('text/plain', text);
        input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
        await new Promise(r => setTimeout(r, 80));
      }
    }
    if (!autoSend) { toast('Prêt : appuie sur Entrée'); return true; }
    await new Promise(r => setTimeout(r, 60));
    const ev = o => new KeyboardEvent(o, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true });
    input.dispatchEvent(ev('keydown')); input.dispatchEvent(ev('keypress')); input.dispatchEvent(ev('keyup'));
    await new Promise(r => setTimeout(r, 150));
    const left = input.value !== undefined ? input.value : input.textContent;
    if (left && left.includes(text)) { const b = sendButton(input); if (b) b.click(); }
    return true;
  }

  /* ═══════════ LE PANNEAU ═══════════ */
  const last = {};
  const panel = document.createElement('div'); panel.id = 'osk-panel';
  panel.innerHTML = `<h3>${FACE}OSKOUA</h3><div class="sub">Clique pour faire réagir Oskoua sur le live</div>
    <div id="osk-grid">${SKETCHS.map(([c, e, n]) => `<div class="osk-t" data-c="${c}" title="!${c}"><span class="e">${e}</span>${n}<span class="cd"></span></div>`).join('')}</div>
    <div id="osk-tts"><input maxlength="150" placeholder="Fais parler Oskoua (!tts)…"><button>🗣️ Dire</button></div>
    <div class="osk-opt"><label><input type="checkbox" id="osk-send"> envoyer directement</label><span>Oskouate 💚</span></div>`;
  document.body.appendChild(panel);
  const sendBox = panel.querySelector('#osk-send'); sendBox.checked = autoSend;
  sendBox.onchange = () => { autoSend = sendBox.checked; pref.set('send', autoSend); };

  panel.querySelectorAll('.osk-t').forEach(t => t.onclick = async () => {
    const c = t.dataset.c, now = Date.now();
    if (now - (last[c] || 0) < COOLDOWN * 1000) return;
    if (await sendToChat('!' + c)) { last[c] = now; tickCd(); }
  });
  const ttsIn = panel.querySelector('#osk-tts input');
  const sayTts = async () => { const t = ttsIn.value.trim(); if (!t) return; if (await sendToChat('!tts ' + t)) ttsIn.value = ''; };
  panel.querySelector('#osk-tts button').onclick = sayTts;
  ttsIn.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); sayTts(); } };

  function tickCd() {
    const now = Date.now(); let any = false;
    panel.querySelectorAll('.osk-t').forEach(t => {
      const s = Math.ceil((COOLDOWN * 1000 - (now - (last[t.dataset.c] || 0))) / 1000);
      t.classList.toggle('wait', s > 0); t.querySelector('.cd').textContent = s > 0 ? s + 's' : ''; if (s > 0) any = true;
    });
    if (any) setTimeout(tickCd, 500);
  }

  /* ═══════════ LE BOUTON (dans la barre du t'chat, sinon flottant) ═══════════ */
  const btn = document.createElement('button'); btn.id = 'osk-btn'; btn.type = 'button'; btn.title = 'Oskoua'; btn.innerHTML = FACE;
  btn.onclick = e => {
    e.preventDefault(); e.stopPropagation();
    if (panel.classList.contains('on')) return panel.classList.remove('on');
    const r = btn.getBoundingClientRect();
    panel.style.left = Math.max(8, Math.min(innerWidth - 342, r.right - 330)) + 'px';
    panel.style.top = ''; panel.style.bottom = (innerHeight - r.top + 8) + 'px';
    panel.classList.add('on'); tickCd();
  };
  document.addEventListener('click', e => { if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) panel.classList.remove('on'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') panel.classList.remove('on'); });

  function place() {
    const input = chatInput();
    if (input) {
      // à côté du bouton des émotes, ou juste avant le champ
      const bar = input.closest('form') || input.parentElement?.parentElement || input.parentElement;
      const emoteBtn = bar && [...bar.querySelectorAll('button')].find(b => /emote|emoji/i.test((b.getAttribute('aria-label') || '') + (b.dataset.testid || '') + b.className));
      const host = emoteBtn ? emoteBtn.parentElement : bar;
      if (host && btn.parentElement !== host) { btn.classList.remove('floating'); emoteBtn ? emoteBtn.before(btn) : host.prepend(btn); }
    } else if (!btn.isConnected || !btn.classList.contains('floating')) {
      btn.classList.add('floating'); document.body.appendChild(btn);
    }
  }
  // Kick est une appli qui recharge des morceaux de page : on vérifie régulièrement que le bouton est toujours là
  place(); setInterval(() => { if (!btn.isConnected || btn.classList.contains('floating')) place(); }, 1500);
})();

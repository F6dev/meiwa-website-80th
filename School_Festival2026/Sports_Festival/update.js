(() => {
  // === 設定 ===
  const API_URL = "https://student.meiwa.website/api/hp_sfdata";
  const POLL_INTERVAL_MS = 30000;
  const CONTAINER_ID = "results-dynamic-container";
  const MAX_DISPLAY_RANK = 9;
  // === 表示スタイル設定（変更ポイント①）===
  // テキスト部分の装飾スタイルを切り替え可能
  // 候補: "none" | "highlight" | "underline" | "border-left" | "pill-badge"
  const DISPLAY_STYLE = "highlight";
  // [変更①] テキスト装飾色の不透明度（0.0〜1.0）
  const TEXT_DECOR_OPACITY = 100.0;

  const TEXT_DECOR_COLORS = {
    red: "#e6c6c6", orange: "#e5d1b2", yellow: "#ece7c7",
    green: "#cfe3cf", blue: "#cddbe6", purple: "#d9d7ea",
    pink: "#e7d2e4", black: "#cfcfcf", white: "#f9f9f9"
  };
  const TEXT_DECOR_COLOR_ARRAY = Object.values(TEXT_DECOR_COLORS);

  const DISPLAY_ORDER = [
    "ball_toss", "obstacle_relay", "tug_of_war", "club_relay",
    "long_jump_rope", "giant_ball_roll", "eye_of_typhoon",
    "block_relay", "scavenger_hunt", "total_result"
  ];
  const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32", "#A0A0A0", "#888888"];
  let lastDataString = null;
  let pollTimerId = null;

  /* ---------------------------
     動的スタイル注入
  --------------------------- */
  function injectStyles() {
    if (document.getElementById("dynamic-results-styles")) return;
    const css = `
      .competition-results { list-style: none; padding: 0; margin: 0.5rem 0 0; }
      .competition-results li {
        list-style: none; padding: 0.4rem 0.6rem; margin: 0.2rem 0;
        border-radius: 8px; font-size: 1rem; background: rgba(255,255,255,0.03);
        word-break: break-word; display: flex; align-items: center;
      }
      .team-name { transition: background-color 0.2s ease; }
      .team-name.style-highlight { padding: 2px 8px; border-radius: 4px; }
      .team-name.style-underline { border-bottom: 2px solid; padding-bottom: 1px; }
      .team-name.style-border-left { border-left: 3px solid; padding-left: 10px; }
      .team-name.style-pill-badge {
        padding: 2px 10px; border-radius: 12px; font-weight: 600;
        box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      }
      #toast-container {
        position: fixed; left: 50%; transform: translateX(-50%);
        bottom: env(safe-area-inset-bottom, 20px); z-index: 9999;
        display: flex; flex-direction: column; gap: 0.5rem; align-items: center; pointer-events: none;
      }
      .toast {
        pointer-events: auto; min-width: 160px; max-width: calc(100vw - 40px); padding: 0.8rem 1rem;
        border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.25); background: rgba(0,0,0,0.85);
        color: #fff; font-size: 0.95rem; line-height: 1.2; display:flex; align-items:center; gap:0.6rem;
      }
      .toast .msg { flex: 1; }
      .toast button.dismiss {
        background: transparent; border: none; color: #fff; font-size: 1.1rem; cursor: pointer; opacity: 0.9;
      }
      @media (max-width: 480px) {
        .toast { font-size: 0.95rem; padding: 0.7rem 0.9rem; border-radius: 10px; }
      }
    `;
    const styleEl = document.createElement("style");
    styleEl.id = "dynamic-results-styles";
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  /* ---------------------------
     通知（トースト）
  --------------------------- */
  function showNotification(message, options = {}) {
    const { duration = 5000, type = "info" } = options;
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");

    const msg = document.createElement("div");
    msg.className = "msg";
    msg.textContent = message;

    const btn = document.createElement("button");
    btn.className = "dismiss";
    btn.setAttribute("aria-label", "閉じる");
    btn.innerHTML = "✕";
    btn.addEventListener("click", () => {
      toast.style.transition = "opacity 240ms ease";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 260);
    });

    if (type === "error") toast.style.borderLeft = "4px solid #ff5c5c";

    toast.appendChild(msg);
    toast.appendChild(btn);
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 260);
      }
    }, duration);
  }

  /* ---------------------------
     色ユーティリティ
  --------------------------- */
  function hexToRgba(hex, alpha = 1) {
    const h = hex.replace("#", "");
    const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
    return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
  }
  function shadeColor(hex, percent) {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    let [r, g, b] = [parseInt(h, 16) >> 16, (parseInt(h, 16) >> 8) & 0xff, parseInt(h, 16) & 0xff]
      .map(c => Math.max(0, Math.min(255, c + percent)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }
  function contrastColor(hex) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const yiq = (((bigint >> 16) & 255) * 299 + ((bigint >> 8) & 255) * 587 + (bigint & 255) * 114) / 1000;
    return yiq >= 128 ? "#000" : "#fff";
  }

  /* ---------------------------
     結果パース・ソート・フィルタ
  --------------------------- */
  function parseAndSortResults(resultsStr) {
    if (!resultsStr || typeof resultsStr !== "string" || !resultsStr.trim()) return [];
    return resultsStr.split(",")
      .map(item => {
        const [rankStr, ...teamParts] = item.trim().split(":");
        return { rank: parseInt(rankStr, 10), team: teamParts.join(":").trim() };
      })
      .filter(r => !isNaN(r.rank) && r.rank >= 1 && r.team)
      .filter(r => r.rank <= MAX_DISPLAY_RANK)
      .sort((a, b) => a.rank - b.rank);
  }

  /* ---------------------------
     装飾色取得ヘルパー
  --------------------------- */
  // ブロック名 → 色のマッピング（日本語キー）
  const BLOCK_COLORS = {
    "赤": "#e6c6c6",
    "橙": "#e5d1b2",
    "黄": "#ece7c7",
    "緑": "#cfe3cf",
    "青": "#cddbe6",
    "紫": "#d9d7ea",
    "桃": "#e7d2e4",
    "黒": "#cfcfcf",
    "白": "#f9f9f9"
  };

  // チーム名からブロック色を取得
  function getBlockColor(teamName) {
    for (const [blockName, color] of Object.entries(BLOCK_COLORS)) {
      if (teamName.includes(blockName)) {
        return color;
      }
    }
    return "#f0f0f0"; // デフォルト: 薄いグレー
  }

function renderResults(competitions) {
  const container = document.getElementById(CONTAINER_ID);
  if (!container) return console.warn(`⚠️ #${CONTAINER_ID} が見つかりません`);

  container.innerHTML = "";

  const compMap = new Map(competitions.map(c => [c.name_en, c]));

  DISPLAY_ORDER.forEach(nameEn => {
    const comp = compMap.get(nameEn);
    if (!comp) return;

    const flexEl = document.createElement("div");
    flexEl.className = "common-flex-element";
    flexEl.innerHTML = `
      <div class="common-flex-icon common-flex-icon-square"></div>
      <div class="common-flex-main">
        <strong>${comp.name_ja}</strong>
        <ul class="competition-results" id="${nameEn}"></ul>
      </div>
    `;

    const ul = flexEl.querySelector("ul");
    const results = parseAndSortResults(comp.results);

    results.forEach(({ rank, team }) => {
      const li = document.createElement("li");
      const colorIdx = Math.min(rank - 1, RANK_COLORS.length - 1);
      const rankColor = RANK_COLORS[colorIdx]; // 順位の色（金・銀・銅）
      const textColor = contrastColor(rankColor);

      li.style.cssText = `
        background: linear-gradient(90deg, rgba(0,0,0,0.04), rgba(255,255,255,0.02));
        border: 1px solid ${shadeColor(rankColor, -30)};
        box-shadow: inset 0 0 0 2px ${hexToRgba(rankColor, 0.06)};
        color: ${textColor}; font-weight: 600;
      `;

      const badge = document.createElement("span");
      badge.textContent = rank;
      badge.style.cssText = `
        display: inline-block; min-width: 28px; height: 22px; line-height: 22px;
        text-align: center; margin-right: 8px; border-radius: 6px; padding: 0 6px;
        background: ${rankColor}; color: ${textColor}; font-weight: 700;
      `;

      li.appendChild(badge);

      // 【修正】チーム名からブロック色を取得して背景に適用
      const teamSpan = document.createElement("span");
      teamSpan.textContent = team;
      
      // ブロック色を取得
      const blockColor = getBlockColor(team);
      
      // チーム名の背景をブロック色で薄く表示
      teamSpan.style.cssText = `
        background: ${hexToRgba(blockColor, 1.0)};
        padding: 2px 8px;
        border-radius: 4px;
        margin-left: 4px;
        color: #1a1a1a; /* 文字は黒系で統一 */
        font-weight: 600;
      `;

      li.appendChild(teamSpan);
      ul.appendChild(li);
    });

    container.appendChild(flexEl);
  });
}

  /* ---------------------------
     差分検知用ヘルパー
  --------------------------- */
  function computeUpdatedNames(prevComps = [], newComps = []) {
    const mapPrev = new Map(prevComps.map(c => [c.name_en, JSON.stringify(c.results || [])]));
    const updated = [];
    newComps.forEach(c => {
      const prev = mapPrev.get(c.name_en);
      const now = JSON.stringify(c.results || []);
      if (prev === undefined || prev !== now) updated.push(c.name_ja || c.name_en);
    });
    return updated;
  }

  /* ---------------------------
     データ取得・更新ループ
  --------------------------- */
  async function fetchAndUpdate() {
    try {
      const resp = await fetch(API_URL, { cache: "no-store" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      let comps = [];
      if (Array.isArray(json.data)) comps = json.data;
      else if (json.data && Array.isArray(json.data.competitions)) comps = json.data.competitions;
      else throw new Error("データ形式が不正です");

      const newDataString = JSON.stringify(comps);
      if (lastDataString === null) {
        renderResults(comps);
        console.log(`%c[初回読み込み] ${new Date().toLocaleTimeString()}`, "color:#4CAF50;font-weight:bold;");
        lastDataString = newDataString;
      } else if (lastDataString !== newDataString) {
        renderResults(comps);
        const updatedNames = computeUpdatedNames(JSON.parse(lastDataString), comps);
        const msg = updatedNames.length > 0
          ? `更新: ${updatedNames.join(", ")} の結果が更新されました。`
          : "結果が更新されました。";
        showNotification(msg, { duration: 6000, type: "success" });
        lastDataString = newDataString;
      }
    } catch (err) {
      console.error("データ取得エラー:", err);
      showNotification("結果の取得に失敗しました。通信状況を確認してください。", { duration: 6000, type: "error" });
    }
  }

  /* ---------------------------
     初期化
  --------------------------- */
  function init() {
    injectStyles();
    fetchAndUpdate();
    pollTimerId = setInterval(fetchAndUpdate, POLL_INTERVAL_MS);
    window.addEventListener("beforeunload", () => { if (pollTimerId) clearInterval(pollTimerId); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
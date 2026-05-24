// update.js
(() => {
  // === 設定 ===
  const API_URL = "https://example.com/api/hp_sfdata";
  const POLL_INTERVAL_MS = 30000;
  const CONTAINER_ID = "results-dynamic-container"; // index.html の容器ID
  const MAX_DISPLAY_RANK = 9; // 表示順位上限（変数で制御）

  // === [新規追加] 表示スタイル設定 ===
  // 選択肢: 'highlight' | 'border' | 'gradient' | 'minimal'
  // 各スタイルの詳細は後述の STYLE_CONFIG を参照
  const DISPLAY_STYLE = "highlight";

  // === [新規追加] カラーパレット（指定色を基調）===
  // 競技ブロックの色付けに使用。key は競技の識別子やチーム色などに紐付け可能
  const COLOR_PALETTE = {
    red:    "#e6c6c6", // 赤
    orange: "#e5d1b2", // 橙
    yellow: "#ece7c7", // 黄
    green:  "#cfe3cf", // 緑
    blue:   "#cddbe6", // 青
    purple: "#d9d7ea", // 紫
    pink:   "#e7d2e4", // 桃
    black:  "#cfcfcf", // 黒
    white:  "#f9f9f9", // 白
  };

  // === [新規追加] スタイル設定マップ ===
  // 各 DISPLAY_STYLE における見た目の定義
  // - badgeBg: 順位バッジの背景色（COLOR_PALETTE key or hex）
  // - itemBg: 結果アイテムの背景
  // - itemBorder: 境界線スタイル
  // - highlight: テキスト強調方法（'underline' | 'bold' | 'none'）
  const STYLE_CONFIG = {
    highlight: {
      badgeBg: COLOR_PALETTE.blue,
      itemBg: `linear-gradient(90deg, ${COLOR_PALETTE.white}, ${COLOR_PALETTE.blue}33)`,
      itemBorder: `2px solid ${COLOR_PALETTE.blue}`,
      highlight: "bold",
    },
    border: {
      badgeBg: COLOR_PALETTE.green,
      itemBg: COLOR_PALETTE.white,
      itemBorder: `3px solid ${COLOR_PALETTE.green}`,
      highlight: "underline",
    },
    gradient: {
      badgeBg: COLOR_PALETTE.purple,
      itemBg: `linear-gradient(135deg, ${COLOR_PALETTE.white}, ${COLOR_PALETTE.purple}44)`,
      itemBorder: `1px dashed ${COLOR_PALETTE.purple}`,
      highlight: "bold",
    },
    minimal: {
      badgeBg: COLOR_PALETTE.black,
      itemBg: "transparent",
      itemBorder: `1px solid ${COLOR_PALETTE.black}40`,
      highlight: "none",
    },
  };

  // 表示順リスト（JSONの name_en と完全一致）
  const DISPLAY_ORDER = [
    "ball_toss",          // 玉入れ
    "obstacle_relay",     // 障害物リレー
    "tug_of_war",         // 綱引き
    "club_relay",         // 部活動リレー
    "long_jump_rope",     // 大縄
    "giant_ball_roll",    // 大玉転がし
    "eye_of_typhoon",     // 台風の目
    "block_relay",        // ブロックリレー
    "scavenger_hunt",     // 借り人競争
    "total_result"        // 競技順位（総合結果）
  ];

  // [変更] RANK_COLORS: 従来の順位色も残しつつ、必要に応じて COLOR_PALETTE と併用可能
  const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32", "#A0A0A0", "#888888"];
  let lastDataString = null;
  let pollTimerId = null;

  /* ---------------------------
     動的スタイル注入
  --------------------------- */
  function injectStyles() {
    if (document.getElementById("dynamic-results-styles")) return;
    // [変更] STYLE_CONFIG に基づく追加スタイルを注入
    const styleConfig = STYLE_CONFIG[DISPLAY_STYLE] || STYLE_CONFIG.highlight;
    const highlightRule = (() => {
      switch (styleConfig.highlight) {
        case "underline": return "text-decoration: underline 2px;";
        case "bold": return "font-weight: 700;";
        default: return "";
      }
    })();

    const css = `
      .competition-results { list-style: none; padding: 0; margin: 0.5rem 0 0; }
      .competition-results li {
        list-style: none; padding: 0.4rem 0.6rem; margin: 0.2rem 0;
        border-radius: 8px; font-size: 1rem; background: rgba(255,255,255,0.03);
        word-break: break-word; display: flex; align-items: center;
      }
      /* [新規] スタイルモード別ベース装飾 */
      .competition-results li.style-mode {
        background: ${styleConfig.itemBg};
        border: ${styleConfig.itemBorder};
      }
      .competition-results li.style-mode .team-name {
        ${highlightRule}
      }
      /* [新規] 順位バッジのモード別カラー */
      .rank-badge.mode-style {
        background: ${styleConfig.badgeBg};
        color: ${contrastColor(styleConfig.badgeBg)};
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
      .filter(r => r.rank <= MAX_DISPLAY_RANK)  // 上限フィルタ
      .sort((a, b) => a.rank - b.rank);          // 順位でソート
  }

  /* ---------------------------
     [変更] DOM生成・描画（新ロジック＋スタイルモード対応）
  --------------------------- */
  function renderResults(competitions) {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return console.warn(`⚠️ #${CONTAINER_ID} が見つかりません`);

    // 既存コンテンツをクリア
    container.innerHTML = "";

    // 高速検索用Map
    const compMap = new Map(competitions.map(c => [c.name_en, c]));

    // [新規] 現在選択中のスタイル設定を取得
    const styleConfig = STYLE_CONFIG[DISPLAY_STYLE] || STYLE_CONFIG.highlight;

    // 指定順でループ
    DISPLAY_ORDER.forEach(nameEn => {
      const comp = compMap.get(nameEn);
      if (!comp) return; // データにない競技はスキップ

      // common-flex-element を生成
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

      // [変更] 競技ごとにカラーパレットから色を割り当て（name_en のハッシュで簡易決定）
      const paletteKeys = Object.keys(COLOR_PALETTE);
      const colorIndex = nameEn.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % paletteKeys.length;
      const blockBaseColor = COLOR_PALETTE[paletteKeys[colorIndex]];

      // 結果をliで追加
      results.forEach(({ rank, team }) => {
        const li = document.createElement("li");
        
        // [変更] スタイルモード用のクラスとインラインスタイルを適用
        li.classList.add("style-mode");
        li.style.cssText = `
          ${li.style.cssText}
          border-color: ${shadeColor(blockBaseColor, -20)};
        `;

        // [変更] 順位バッジにモード別スタイルを適用
        const badge = document.createElement("span");
        badge.className = "rank-badge mode-style"; // [新規] CSSフック用クラス
        badge.textContent = rank;
        // badge の色は injectStyles() 内の .rank-badge.mode-style で一括管理

        // [変更] チーム名要素で強調スタイルを適用
        const teamSpan = document.createElement("span");
        teamSpan.className = "team-name";
        teamSpan.textContent = team;

        li.appendChild(badge);
        li.appendChild(teamSpan); // [変更] 直接テキストではなく span 経由でスタイル適用
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
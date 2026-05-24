// script.js
(() => {
  const API_URL = "https://student.meiwa.website/api/hp_sfdata";
  const POLL_INTERVAL_MS = 60000; // 60000ms = 60s

  // ランク色（5位まで対応、5位以降は最後の色を適用）
  const RANK_COLORS = [
    "#FFD700", // 第1位: 金 (Gold)
    "#C0C0C0", // 第2位: 銀 (Silver)
    "#CD7F32", // 第3位: 銅 (Bronze)
    "#A0A0A0", // 第4位: グレー (Gray)
    "#888888", // 第5位+: 濃いグレー (Dark Gray)
  ];

  // 内部保持する最後に取得したデータ（比較用）
  let lastDataString = null;
  let pollTimerId = null;

  /* ---------------------------
     スタイルを動的に挿入（モバイル対応含む）
     --------------------------- */
  function insertStyles() {
    if (document.getElementById("dynamic-competition-styles")) return;
    const css = `
      /* リスト内アイテム */
      .competition-results li {
        list-style: none;
        padding: 0.4rem 0.6rem;
        margin: 0.2rem 0;
        border-radius: 8px;
        font-size: 1rem;
        background: rgba(255,255,255,0.03);
        word-break: break-word;
      }

      /* トースト（通知）コンテナ */
      #toast-container {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        bottom: env(safe-area-inset-bottom, 20px);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
        pointer-events: none; /* 個々のトーストが pointer-events を受ける */
      }
      .toast {
        pointer-events: auto;
        min-width: 160px;
        max-width: calc(100vw - 40px);
        padding: 0.8rem 1rem;
        border-radius: 12px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.25);
        background: rgba(0,0,0,0.85);
        color: #fff;
        font-size: 0.95rem;
        line-height: 1.2;
        display:flex;
        align-items:center;
        gap:0.6rem;
      }
      .toast .msg { flex: 1; }
      .toast button.dismiss {
        background: transparent;
        border: none;
        color: #fff;
        font-size: 1.1rem;
        padding: 0;
        margin: 0;
        cursor: pointer;
        opacity: 0.9;
      }
      /* モバイル微調整 */
      @media (max-width: 480px) {
        .toast { font-size: 0.95rem; padding: 0.7rem 0.9rem; border-radius: 10px; }
      }
    `;
    const styleEl = document.createElement("style");
    styleEl.id = "dynamic-competition-styles";
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  /* ---------------------------
     通知（トースト） — 独立関数
     showNotification(message, { duration, type })
     --------------------------- */
  function showNotification(message, options = {}) {
    const { duration = 5000, type = "info" } = options;

    // コンテナ作成（最初の1回だけ）
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "true");
      document.body.appendChild(container);
    }

    // トースト要素
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");

    // メッセージ
    const msg = document.createElement("div");
    msg.className = "msg";
    msg.textContent = message;

    // 閉じるボタン
    const btn = document.createElement("button");
    btn.className = "dismiss";
    btn.setAttribute("aria-label", "閉じる");
    btn.innerHTML = "✕";
    btn.addEventListener("click", () => {
      fadeOutAndRemove(toast);
    });

    // オプションに応じた視覚的指示（type）
    if (type === "success") {
      toast.style.border = "1px solid rgba(255,255,255,0.06)";
    } else if (type === "error") {
      // 赤っぽくアクセント付け
      toast.style.borderLeft = "4px solid #ff5c5c";
    } // 必要なら他の type を追加可能

    toast.appendChild(msg);
    toast.appendChild(btn);
    container.appendChild(toast);

    // 自動で消える
    const autoHide = setTimeout(() => {
      fadeOutAndRemove(toast);
    }, duration);

    function fadeOutAndRemove(el) {
      if (!el) return;
      el.style.transition = "opacity 240ms ease, transform 240ms ease";
      el.style.opacity = "0";
      el.style.transform = "translateY(6px)";
      setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
        clearTimeout(autoHide);
      }, 260);
    }
  }

  /* ---------------------------
     DOM更新: competitions データ -> UL の li を作る
     - API形式: resultsは「1:赤,2:青,1:黄」のような文字列
     - 同率や5位以上にも対応
     --------------------------- */
  function populateCompetitions(competitions) {
    // competitions: Array of objects with id, name_ja, name_en, results (string)
    competitions.forEach((comp) => {
      const nameEn = comp.name_en;
      // id を優先、それがなければ class の ul を探す
      let ul =
        document.querySelector(`ul#${CSS.escape(nameEn)}`) ||
        document.querySelector(`ul.${CSS.escape(nameEn)}`);
      if (!ul) {
        console.warn(
          `UL 要素が見つかりません: ${nameEn} （id または class に "${nameEn}" を持つ ul を用意してください）`
        );
        return;
      }

      // 見た目のためのクラス付与
      ul.classList.add("competition-results");
      // 既存の中身を全削除
      ul.innerHTML = "";

      // resultsを適切な形式に変換（文字列→配列）
      let resultItems = [];
      if (typeof comp.results === "string") {
        resultItems = comp.results
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "");
      } else if (Array.isArray(comp.results)) {
        resultItems = comp.results;
      } else {
        return; // 未対応の形式
      }

      // 各結果を処理
      resultItems.forEach((item) => {
        // 順位とチーム名を分離（例: "1:赤" → [1, "赤"]）
        const [rankStr, ...teamParts] = item.split(":");
        const teamName = teamParts.join(":").trim();
        const rank = parseInt(rankStr, 10);

        // 無効な順位データはスキップ
        if (isNaN(rank) || rank < 1 || !teamName) return;

        // 色のインデックスを計算（5位以上は最後の色を適用）
        const colorIndex = Math.min(rank - 1, RANK_COLORS.length - 1);
        const color = RANK_COLORS[colorIndex];
        const textColor = contrastColor(color);

        // li要素を作成
        const li = document.createElement("li");
        li.textContent = teamName; // チーム名のみ表示

        // ランクに応じたスタイル
        li.style.background =
          "linear-gradient(90deg, rgba(0,0,0,0.04), rgba(255,255,255,0.02))";
        li.style.border = `1px solid ${shadeColor(color, -30)}`;
        li.style.boxShadow = `inset 0 0 0 2px ${hexToRgba(color, 0.06)}`;
        li.style.color = textColor;
        li.style.fontWeight = "600";

        // 順位ラベル（左側に表示）
        const label = document.createElement("span");
        label.textContent = rank; // 順位数値を表示
        label.setAttribute("aria-hidden", "true");
        label.style.display = "inline-block";
        label.style.minWidth = "28px";
        label.style.height = "22px";
        label.style.lineHeight = "22px";
        label.style.textAlign = "center";
        label.style.marginRight = "8px";
        label.style.borderRadius = "6px";
        label.style.padding = "0 6px";
        label.style.background = color;
        label.style.color = textColor;
        label.style.fontWeight = "700";

        li.prepend(label);
        ul.appendChild(li);
      });
    });
  }

  /* ---------------------------
     補助関数: 色ユーティリティ
     - hexToRgba, shadeColor, contrastColor (白 or 黒)
     --------------------------- */
  function hexToRgba(hex, alpha = 1) {
    const h = hex.replace("#", "");
    const bigint = parseInt(
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h,
      16
    );
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // 色を明るく/暗くする（-100〜100）
  function shadeColor(hex, percent) {
    let h = hex.replace("#", "");
    if (h.length === 3)
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    const num = parseInt(h, 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  }
  // コントラストの良い文字色（白 or 黒）を返す
  function contrastColor(hex) {
    const h = hex.replace("#", "");
    const bigint = parseInt(
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h,
      16
    );
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    // 相対輝度の簡易判定
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000" : "#fff";
  }

  /* ---------------------------
     データ取得と更新判定
     --------------------------- */
  async function fetchAndUpdate() {
    try {
      const resp = await fetch(API_URL, { cache: "no-store" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();

      // === 修正ポイント：data が配列か確認 ===
      let comps = [];
      if (Array.isArray(json.data)) {
        // data が配列 → それがそのまま competitions データ
        comps = json.data;
      } else if (json.data && Array.isArray(json.data.competitions)) {
        // 従来形式にも対応（後方互換）
        comps = json.data.competitions;
      } else {
        console.warn("予期しないデータ構造", json);
        throw new Error("データ形式が不正です");
      }

      // データ文字列化して比較
      const newDataString = JSON.stringify(comps);

      if (lastDataString === null) {
        populateCompetitions(comps);
        console.log(
          `%c[初回データ読み込み] ${new Date().toLocaleTimeString()}`,
          "color: #4CAF50; font-weight: bold;"
        );
        console.log("取得データ:", comps);
        lastDataString = newDataString;
      } else if (lastDataString !== newDataString) {
        populateCompetitions(comps);

        const updatedNames = computeUpdatedNames(
          JSON.parse(lastDataString),
          comps
        );
        const msg =
          updatedNames.length > 0
            ? `更新: ${updatedNames.join(", ")} の結果が更新されました。`
            : "結果が更新されました。";
        showNotification(msg, { duration: 6000, type: "success" });

        // ===== コンソールログ追加 =====
        const timestamp = new Date().toLocaleTimeString();
        console.log(
          `%c[データ更新検知] ${timestamp}`,
          "color: #2196F3; font-weight: bold;"
        );
        console.log(
          `更新された競技: %c${updatedNames.join(", ")}`,
          "color: #FF9800; font-weight: bold;"
        );

        console.group("差分詳細");
        updatedNames.forEach((name) => {
          const prev = JSON.parse(lastDataString).find(
            (c) => c.name_en === name || c.name_ja === name
          );
          const curr = comps.find(
            (c) => c.name_en === name || c.name_ja === name
          );

          console.groupCollapsed(`競技: ${name}`);
          console.log(
            "%c前回データ:",
            "color: #E91E63; font-weight: bold;",
            prev ? prev.results : "なし"
          );
          console.log(
            "%c今回データ:",
            "color: #4CAF50; font-weight: bold;",
            curr ? curr.results : "なし"
          );
          console.groupEnd();
        });
        console.groupEnd();

        console.log("前回全体データ:", JSON.parse(lastDataString));
        console.log("今回全体データ:", comps);
        // =============================

        lastDataString = newDataString;
      }
    } catch (err) {
      console.error("データ取得エラー", err);
      showNotification(
        "結果の取得に失敗しました。通信状況を確認してください。",
        { duration: 6000, type: "error" }
      );
    }
  }

  // 前回データと今回データから name_en の差分を返す（簡易）
  function computeUpdatedNames(prevComps = [], newComps = []) {
    const mapPrev = new Map(
      prevComps.map((c) => [c.name_en, JSON.stringify(c.results || [])])
    );
    const updated = [];
    newComps.forEach((c) => {
      const prev = mapPrev.get(c.name_en);
      const now = JSON.stringify(c.results || []);
      if (prev === undefined || prev !== now) {
        updated.push(c.name_ja || c.name_en);
      }
    });
    return updated;
  }

  /* ---------------------------
     初期化
     --------------------------- */
  function init() {
    insertStyles();
    // 最初の読み込み
    fetchAndUpdate();

    // 定期実行
    pollTimerId = setInterval(fetchAndUpdate, POLL_INTERVAL_MS);

    // ページ離脱時はタイマークリア（丁寧に）
    window.addEventListener("beforeunload", () => {
      if (pollTimerId) clearInterval(pollTimerId);
    });
  }

  // DOMContentLoaded またはすでに DOM が読み込まれている場合は即 init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
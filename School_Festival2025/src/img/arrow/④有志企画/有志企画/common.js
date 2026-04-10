// V.2.0

// これらが動いていない時、defer属性の付け忘れを疑おう
let lastCheckTime = 0;
const CHECK_INTERVAL = 500; // 100msごとにチェック
let activeSectionId = null;

// ヘッダーの高さを動的に取得する関数
function getHeaderHeight() {
  let offHeight;
  const menu = document.getElementById("main-sidebar");
  if (window.innerWidth >= 940 || !menu) {
    const header = document.querySelector("header"); // 実際のヘッダー要素のセレクタに変更
    offHeight = header.offsetHeight + 10;
  } else {
    // console.log("smartphone mode");
    offHeight = menu.getBoundingClientRect().top + menu.offsetHeight + 40;
  }
  // console.log("offHeight", offHeight);
  return offHeight ? offHeight : 0;
}

function checkActiveSection() {
  const now = Date.now();
  if (now - lastCheckTime < CHECK_INTERVAL) {
    requestAnimationFrame(checkActiveSection);
    return;
  }
  lastCheckTime = now;

  // ヘッダーの高さを動的に取得
  const headerHeight = getHeaderHeight();
  let topSection = null;
  let minTop = headerHeight; // ヘッダー高さを基準に
  let maxTop = -Infinity; // ← ここを変更

  document.querySelectorAll("section").forEach((section) => {
    if (section.dataset.navVisible == "false") return;
    const rect = section.getBoundingClientRect();
    if (rect.top <= headerHeight && rect.bottom > 0 && rect.top > maxTop) {
      maxTop = rect.top;
      topSection = section;
    }
  });

  // セクションが切り替わった時のみ処理
  if (topSection && (!activeSectionId || topSection.id !== activeSectionId)) {
    // 以前のアクティブクラスを削除
    document.querySelectorAll("#sidebar-box li").forEach((item) => {
      item.classList.remove("sidebar-item-active");
    });

    // 新しいセクションに応じてアクティブクラスを付与
    activeSectionId = topSection.id;
    const targetLink = document.querySelector(
      `#sidebar-box a[href="#${activeSectionId}"]`
    );

    if (targetLink) {
      // aタグの親要素であるliにクラスを追加
      const sidebarItem = targetLink.parentElement;
      sidebarItem.classList.add("sidebar-item-active");
      console.log("アクティブなサイドバーアイテム:", sidebarItem.id);

      const container = document.getElementById("sidebar-box");
      const el = document.querySelector(".sidebar-item-active");
      // 少しだけmargin
      const offsetPx = 12;

      if (el) {
        // current scroll window
        const visibleLeft = container.scrollLeft;
        const visibleRight = visibleLeft + container.clientWidth;

        // element bounds relative to container
        const elLeft = el.offsetLeft;
        const elRight = elLeft + el.offsetWidth;

        // if element is partially or wholly outside on the right
        if (elRight > visibleRight) {
          // scroll so its right edge aligns with container’s right edge
          container.scrollTo({
            left: elRight - container.clientWidth + offsetPx,
            behavior: "smooth",
          });
        }
        // (optional) if you also want to handle when it’s off to the left:
        else if (elLeft < visibleLeft) {
          container.scrollTo({
            left: elLeft - offsetPx,
            behavior: "smooth",
          });
        }
      }
    }

    console.log("アクティブなセクションID:", activeSectionId);
  }

  requestAnimationFrame(checkActiveSection);
}

// 初期化
requestAnimationFrame(checkActiveSection);

// サイドバーアイテムのテンプレート関数
function createSidebarItem(id, label, href) {
  return `
    <li id="${id}-nav">
      <a href="${href}"><span>${label}</span></a>
    </li>
  `;
}

// サイドバー更新用のグローバル関数を定義
function updateSidebar() {
  const sidebarUl = document.querySelector("#sidebar-box ul");
  if (!sidebarUl) return; // サイドバーがなければ終了

  // 既存のリストをクリア
  sidebarUl.innerHTML = "";

  // すべての section 要素を取得
  const sections = document.querySelectorAll("section");

  sections.forEach((section) => {
    const id = section.id;
    const label = section.dataset.label?.trim() || id;
    const visible = section.dataset.navVisible !== "false"; // デフォルトは表示
    const preferHref = section.dataset.preferHref;

    // ID・ラベルが存在し、表示設定になっている場合のみ追加
    if (!id || !label || !visible) return;

    // サイドバーアイテムのHTMLを生成（※createSidebarItemは別途定義が必要）
    let itemHtml;
    if (preferHref) {
      itemHtml = createSidebarItem(id, label, preferHref);
    } else {
      // preferHrefがない場合
      itemHtml = createSidebarItem(id, label, `#${id}`);
    }
    sidebarUl.insertAdjacentHTML("beforeend", itemHtml);
  });
}
// グローバルスコープに公開
window.updateSidebar = updateSidebar;
// ページロード時に自動実行
document.addEventListener("DOMContentLoaded", updateSidebar);

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search");

  if (searchQuery) {
    const decodedQuery = decodeURIComponent(searchQuery);
    const total = highlightText(decodedQuery);
    if (total > 0) {
      createHighlightNavigation(total);
    }
  }
});

function highlightText(searchWord) {
  const mainElement = document.querySelector("body main");
  if (!mainElement || !searchWord) return 0;

  const escapedWord = searchWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedWord})`, "gi");
  let highlightCounter = 1;

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const matches = node.textContent.match(regex);
      if (matches && matches.length > 0) {
        const fragment = document.createDocumentFragment();
        let text = node.textContent;

        matches.forEach((match) => {
          const matchIndex = text.indexOf(match);
          const beforeText = text.substring(0, matchIndex);

          if (beforeText) {
            fragment.appendChild(document.createTextNode(beforeText));
          }

          const highlight = document.createElement("mark");
          highlight.id = `hl-${highlightCounter++}`;
          highlight.className = "search-highlight";
          highlight.textContent = match;
          fragment.appendChild(highlight);

          text = text.substring(matchIndex + match.length);
        });

        if (text) {
          fragment.appendChild(document.createTextNode(text));
        }

        node.parentNode.replaceChild(fragment, node);
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !["SCRIPT", "STYLE", "MARK"].includes(node.tagName)
    ) {
      Array.from(node.childNodes).forEach(walk);
    }
  };

  Array.from(mainElement.childNodes).forEach(walk);
  return highlightCounter - 1;
}

function createHighlightNavigation(totalHighlights) {
  const navPanel = document.createElement("div");
  navPanel.id = "hl-nav";
  navPanel.innerHTML = `
        <button id="hl-prev" aria-label="前へ">←</button>
        <div id="hl-counter">
            <input type="number" id="hl-input" min="1" max="${totalHighlights}" value="1">
            <span> / ${totalHighlights}</span>
        </div>
        <button id="hl-next" aria-label="次へ">→</button>
    `;
  document.body.appendChild(navPanel);

  // 状態管理
  let currentIndex = 1;
  updateCounter();

  // イベントリスナー
  document
    .getElementById("hl-prev")
    .addEventListener("click", () => navigateTo(-1));
  document
    .getElementById("hl-next")
    .addEventListener("click", () => navigateTo(1));
  document
    .getElementById("hl-input")
    .addEventListener("change", navigateToInput);

  // キーボードショートカット
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "ArrowLeft") navigateTo(-1);
    if (e.altKey && e.key === "ArrowRight") navigateTo(1);
  });

  function navigateTo(offset) {
    currentIndex = Math.max(
      1,
      Math.min(totalHighlights, currentIndex + offset)
    );
    updateCounter();
    scrollToHighlight(`hl-${currentIndex}`);
  }

  function navigateToInput() {
    const input = document.getElementById("hl-input");
    const value = parseInt(input.value);
    if (!isNaN(value) && value >= 1 && value <= totalHighlights) {
      currentIndex = value;
      scrollToHighlight(`hl-${currentIndex}`);
    } else {
      input.value = currentIndex;
    }
  }

  function updateCounter() {
    document.getElementById("hl-input").value = currentIndex;
  }
}

function scrollToHighlight(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.add("hl-focus");
    setTimeout(() => element.classList.remove("hl-focus"), 1500);
  }
}

class Header extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = `
      <style>
        :host {
          --header-height: 70px;
          --bg-color: rgba(241, 239, 238, 0.95);
          --blur: 5px;
          --gap: 1.5rem;
          display: block;
        }

        header {
          font-family: sans-serif;
          box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.05);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 50px;
          background-color: rgba(255, 253, 252, 0.95);
          backdrop-filter: blur(100px);
          will-change: filter;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5px;
          box-sizing: border-box;
          border-radius: 0 0 15px 15px;
          z-index: 998;
        }

        .logo {
          display: flex;
          align-items: center;
          height: 100%;
          cursor: pointer;
          width: auto;
          padding-left: 5px;
          padding-right: 5px;
          border-radius: 7px;
          opacity: 0.9;
          transition: 0.3s ease-in-out;
          position: relative;
          overflow: hidden;
        }

        .logo img {
          height: 51px;
          width: auto;
          object-fit: contain;
          position: relative;
          z-index: 1;
        }
        
        /* キラーンエフェクト用の疑似要素 - アイコンのみに限定 */
        .logo::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 51px; /* アイコンの幅に合わせる */
          height: 51px; /* アイコンの高さに合わせる */
          background-image: linear-gradient(130deg, 
            rgba(255, 255, 0, 0) 25%, 
            rgba(250, 250, 250, 0.6) 50%, 
            rgba(255, 255, 0, 0) 55%
          );
          // transition: left 0.5s ease-out;
          z-index: 2;
          pointer-events: none;
        }
            
        .logo:hover { 
          background-color:rgba(250, 250, 250, 1);
          box-shadow: 0 2px 10px -2px rgb(33 37 56 / 10%); 
        }
        
        /* ホバー時のアニメーション - 逆再生されないように */
        .logo:hover::before {
          left: 100%;
          transition: left 0.4s ease-in-out;
        }
        
        /* ホバーが外れた時はアニメーションなしで即座にリセット */
        .logo:not(:hover)::before {
          left: -100%;
          transition: none;
        }
          
        /* ナビゲーションのリンクの部分全体 */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-right: 1rem;
        }

        header nav {
          display: flex; gap: clamp(7px, 1.2vw, 50px);
        }
        
        header nav a {
          font-size: 1rem;
          text-decoration: none;
          color: #333;
          /* リンク部分の当たり範囲を大きく */
          padding: 1em 0.5em;
          transition: background .2s, color .2s, transform .2s;
          border-radius: 6px;
        }

        header nav a:hover {
          background: rgba(0,0,0,0.05); transform: translateY(-2px);
        }

        /* 検索アイコンやメニューアイコン */
        .icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          cursor: pointer;
          transition: background .2s, transform .2s;
          border-radius: 50%;
        }

        .icon:hover {
          background: rgba(0,0,0,0.1);
        }

        .icon img {
          max-width: 100%; max-height: 100%;
        }

        /* 幅941px~1010pxでヘッダーのリンクが改行される問題を直す */
        @media (min-width: 941px) and (max-width: 1010px) {
          .icon {
            width: 2rem;
            height: 2rem;
          }

          .logo img {
            height: 45px;
            width: auto;
          }

          header nav {
            gap: 7px;
          }
          
          .link-collection-trigger {
            margin: 0;
          }
        }

        @media (max-width: 940px) {
          header nav { display: none; }
          .menu-toggle { display: inline-flex; }
        }

        @media (min-width: 941px) {
          .menu-toggle { display: none; }
        }

        /* モバイルメニュー全体のスタイル */
        .mobile-only {
            display: none;
        }
        
        @media (width <= 940px) {
            .mobile-only {
                display: inline-block;
            }
        }

        /* モーダル本体 */
        /* キーフレームアニメーション（検索モーダルと共通） */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        /* モーダル表示中のbody制御 */
        body.modal-open {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
        }

        /* モバイルメニューの背景要素（検索モーダルと同じスタイル） */
        .mobile-menu-bg {
          width: 100vw;
          height: 100vh;
          position: fixed;
          z-index: 999; /* 他の要素より上に表示 */
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          top: 0;
          left: 0;
          display: none;
          pointer-events: auto;
        }

        .mobile-menu-bg.fade-in {
          animation: fadeIn 0.2s forwards;
        }

        .mobile-menu-bg.fade-out {
          animation: fadeOut 0.2s forwards;
        }

        /* モバイルメニュー本体 */
        /* モーダル内のフォントファミリーを明示的に指定 */
        .mobile-menu-modal .modal-content,
        .mobile-menu-title,
        .mobile-menu-link-title,
        .mobile-menu-sub-link {
          font-family: "Zen Maru Gothic", sans-serif;
        }

        .mobile-menu-modal {
          position: fixed;
          z-index: 1000; /* 背景より上に表示 */
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          display: none;
        }

        .mobile-menu-modal.fade-in {
          animation: fadeIn 0.2s forwards;
        }

        .mobile-menu-modal.fade-out {
          animation: fadeOut 0.2s forwards;
        }

        .mobile-menu-modal .modal-content {
          background: #fff;
          width: 85vw;
          /* height: 80vh; */
          max-width: 550px;
          border-radius: 1.5vw;
          padding: 2vw;
          position: relative;
          max-height: 80dvh !important;
        }

        .modal-content {
          overflow-y: scroll;
        }

        /* スクロールバーのスタイル（オプション） */
        .modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 4px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #ccc;
        }

        /* モーダル内部の要素スタイル */
        .close {
          position: absolute;
          top: 2vw;
          right: 4vw;
          font-size: 2rem;
          cursor: pointer;
        }

        .close:hover {
          color: gray;
        }

        .mobile-menu-title {
        /*
        position: sticky;
        top: 0;
        width: 100%;
        background-color: white;
        */
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          margin: 0.5vw 0 2vw 0;
        }

        #mobile-menu-nav {
          display: flex;
          flex-direction: column;
          gap: 2vw;
          margin-top: 2vw;
        }

        /* メニューリンク部分 */
        .mobile-menu-link-wrapper {
          border-bottom: 3px solid #eee;
          padding: 12px 0;
          transition: background .2s, color .2s, transform .2s;
        }

        .mobile-menu-link-wrapper:hover {
          background: rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }

        .mobile-menu-link-wrapper:last-child {
          border-bottom: none;
        }

        .mobile-menu-link-flex {
          display: flex;
          align-items: center;
          width: 100%;
          text-decoration: none;
          color: inherit;
          gap: 5px;
        }

        .mobile-menu-link-title {
          font-size: 1.2rem;
          color: #222;
        }

        .mobile-menu-arrow-img {
          width: 1em;
          height: 1em;
        }

        /* サイトマップなどのサブリンク部分 */
        .mobile-menu-sub-links {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1em;
          margin-top: 1em;
          margin-left: 1vw;
        }

        .mobile-menu-sub-link {
          font-size: 0.95rem;
          color: #555;
          text-decoration: underline;
          opacity: 0.8;
          transition: color 0.2s;
          text-align: left;
        }

        .mobile-menu-sub-link:hover {
          color: #222;
          opacity: 1;
        }

        /* その他(リンク集) */
        /* ヘッダーのリンク部分 */
        .link-collection-trigger {
          position: relative;
          display: inline-block;
          /* リンク部分の当たり範囲を大きく */
          padding: 1em 0.5em;
          // padding-right: 1.5em;
          color: #333;
          text-decoration: none;
          font-size: 1rem;
          border-radius: 6px;
          transition: background .2s, color .2s, transform .2s;
        }

        .link-collection-trigger:hover { 
          background: rgba(0,0,0,0.05); 
          transform: translateY(-2px);
        }
        
        /* リンク集ドロップダウンのスタイル */
        .link-collection-dropdown {
          display: none;
          position: fixed;
          top: 90%;
          right: 5px;
          background: white;
          border-radius: 6px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          min-width: 250px;
          z-index: 1000;
          padding: 10px 0;
          margin-top: 5px;
          opacity: 0;
          transform: translateY(5px);
          transition: opacity 0.3s ease, transform 0.3s ease;
          border-radius: 20px;
          margin: 5px 0;
        }

        .link-collection-dropdown::before {
          content: "";
          position: absolute;
          right: 85px;
          top: -10px;
          width: 30px;
          height: 30px;
          background-color: #FFFFFF;
          transform: rotate(45deg);
          transform-origin: center center;
          /* 要素の一番後ろにすることでリンクをホバーしても吹き出しが三角形のままになるように */
          z-index: -1;
        }

        /* 941px~1010pxで吹き出しがズレる問題を修正する */
        @media (min-width: 941px) and (max-width: 1010px) {
          .link-collection-dropdown::before {
            content: "";
            position: absolute;
            right: 79px;
            top: -10px;
            width: 30px;
            height: 30px;
            background-color: #FFFFFF;
            transform: rotate(45deg);
            transform-origin: center center;
            z-index: -1;
          }
        }

        .link-collection-dropdown ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .link-collection-dropdown li {
          padding: 2px 15px;
        }

        .link-collection-dropdown a {
          color: #333;
          text-decoration: none;
          display: block;
          padding: 20px 10px;
          text-decoration: underline;
        }

        .link-collection-dropdown a:hover {
          background: rgba(0,0,0,0.05);
          // padding-left: 18px;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>

      <header id="common-header">
        <a class="logo" href="/">
          <img src="/aikon.png" alt="明和祭2025 アイコン">
        </a>
        <div class="nav-actions">
          <nav>
            <a href="#">未更新</a>
            <div class="link-collection-dropdown">
              <ul>
                <li><a href="/School_Festival2025/">明和祭2025 ホームページ</a></li>
                <li><a href="/School_Festival2025/App/">明和祭2025 公式アプリ</a></li>
                <li><a href="https://guest.meiwa.website/">明和祭2025 学校説明会予約システム</a></li>
                <li><a href="/Student_Council/sitemap/">サイトマップ</a></li>
                <li><a href="/Student_Council/site-policy/">サイトポリシー</a></li>
              </ul>
            </div>
          </nav>
          <!-- 検索ボタン -->
          <!-- <div class="icon search-icon" id="button-modalopen">
            <img src="/Student_Council/src/images/search.png" alt="Search">
          </div> -->
          <!-- メニューボタン -->
          <div class="icon menu-toggle">
            <img src="/menu.png" alt="Menu" class="mobile-only">
          </div>
        </div>
      </header>
      <!-- モバイルメニューの背景（ヘッダーの外側に配置） -->
      <div id="mobile-menu-bg" class="mobile-menu-bg" style="display:none;"></div>
      <!-- モバイルメニュー本体（ヘッダーの外側に配置） -->
      <div id="mobile-menu-modal" class="mobile-menu-modal" style="display:none;">
        <div class="modal-content">
          <span id="close-mobile-menu" class="close">&times;</span>
          <div class="mobile-menu-title">Menu</div>
          <nav id="mobile-menu-nav"></nav>
          <div class="mobile-menu-sub-links">
            <a href="/School_Festival2025/" class="mobile-menu-sub-link">明和祭2025 ホームページ</a>
            <a href="/School_Festival2025/App/" class="mobile-menu-sub-link">明和祭2025 公式アプリ</a>
            <a href="https://guest.meiwa.website/" class="mobile-menu-sub-link">明和祭2025 学校説明会予約システム</a>
            <a href="https://meiwa-h.aichi-c.ed.jp/cms/" class="mobile-menu-sub-link">明和高等学校公式ウェブサイト</a>
            <a href="/Student_Council/sitemap/" class="mobile-menu-sub-link">サイトマップ</a>
            <a href="/Student_Council/site-policy/" class="mobile-menu-sub-link">サイトポリシー</a>
          </div>
        </div>
      </div>
    `;
    // connectedCallbackメソッドの最後に追加（430行目付近）
    setTimeout(() => {
      const trigger = this.querySelector(".link-collection-trigger");
      const dropdown = this.querySelector(".link-collection-dropdown");

      if (!trigger || !dropdown) return;

      let timeoutId = null;

      // ホバー時にドロップダウンを表示
      trigger.addEventListener("mouseenter", () => {
        clearTimeout(timeoutId);
        dropdown.style.display = "block";
        // 直ちにアニメーション開始
        requestAnimationFrame(() => {
          dropdown.style.opacity = "1";
          dropdown.style.transform = "translateY(0)";
        });
      });

      // マウスが離れた時に非表示
      trigger.addEventListener("mouseleave", () => {
        timeoutId = setTimeout(() => {
          dropdown.style.opacity = "0";
          dropdown.style.transform = "translateY(5px)";
          setTimeout(() => {
            if (
              dropdown.style.opacity === "0" ||
              dropdown.style.opacity === "0.0"
            ) {
              dropdown.style.display = "none";
            }
          }, 300);
        }, 200);
      });

      // ドロップダウン内でもホバー状態を維持
      dropdown.addEventListener("mouseenter", () => {
        clearTimeout(timeoutId);
        dropdown.style.display = "block";
        dropdown.style.opacity = "1";
        dropdown.style.transform = "translateY(0)";
      });

      dropdown.addEventListener("mouseleave", () => {
        timeoutId = setTimeout(() => {
          dropdown.style.opacity = "0";
          dropdown.style.transform = "translateY(5px)";
          setTimeout(() => {
            if (
              dropdown.style.opacity === "0" ||
              dropdown.style.opacity === "0.0"
            ) {
              dropdown.style.display = "none";
            }
          }, 300);
        }, 200);
      });

      // href="#"のデフォルト動作を防ぐ
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
      });
    }, 100);
  }
}

customElements.define("common-header", Header);

class SearchModal extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = `
    <style>
    @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
      .search-bg {
        width: 100vw;
        height: 100vh;
        position: fixed;
        z-index: 999;
        background-color: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        top: 0;
        left: 0;
        display: none;
      }
      .search-bg.fade-in {
        animation: fadeIn 0.2s forwards;
      }
      .search-bg.fade-out {
        animation: fadeOut 0.2s forwards;
      }
      .search-modal {
        font-family: "Zen Maru Gothic", sans-serif;
        height: 80vh;
        height: 85dvh;
        width: 95vw;
        max-width: 1000px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #f9f9f9;
        border-radius: 20px;
        box-shadow: 5px 5px 8px -2px rgba(0, 0, 0, 0.05);
        z-index: 999;
        display: none;
        // display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 20px;
        box-sizing: border-box;
      }

      .search-modal.fade-in {
        animation: fadeIn 0.2s forwards;
      }
      .search-modal.fade-out {
        animation: fadeOut 0.2s forwards;
      }

      .search-box {
        display: flex;
        align-items: center;
        overflow: hidden;
        border: 1px solid #777777;
        border-radius: 25px;
        background-color: white;
        /* margin: 20px; */
        /* この2つで、可変部で変わらないようにする */
        height: 45px;
        flex-shrink: 0;
      }

      .search-box input {
        /* width: 250px; */
        /* width: auto; */
        /* padding: 5px 15px 5px 0; */
        border: none;
        box-sizing: border-box;
        font-size: 1.2em;
        outline: none;
        flex: 1;
      }

      .search-box input::placeholder {
        color: #777777;
      }

      .search-box button {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 45px;
        height: 45px;
        border: none;
        background-color: transparent;
        cursor: pointer;
      }

      .search-box button::before {
        width: 24px;
        height: 24px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z' fill='%23777777'%3E%3C/path%3E%3C/svg%3E");
        background-repeat: no-repeat;
        content: "";
      }

      .search-result {
        margin-top: 10px;
        height: auto;
        /* max-height: 80vh; */
        overflow-y: auto;
        // padding: 0 20px;
      }

      .result-item {
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .result-item:hover {
        background-color: #f5f5f5;
      }

      .result-title {
        font-weight: bold;
        margin-bottom: 5px;
        font-size: 1.2rem;
        text-decoration: underline;
      }

      .result-detail {
        font-size: 0.9em;
        color: #666;
      }

      .result-score {
        font-size: 0.9em;
        color: #666;
        margin-bottom: 5px;
      }

      .result-words {
        font-size: 0.8em;
        color: #888;
      }

      .result-type {
        display: inline-block;
        padding: 2px 6px;
        background-color: #007bff;
        color: white;
        border-radius: 3px;
        font-size: 0.7em;
        margin-right: 5px;
      }

      .search-header {
        height: 2rem;
        margin: 0 auto;
        padding: 0;
        padding-right: 15px;
        flex-shrink: 0;
        font-weight: bolder;
      }

      .search-header p {
        font-size: 1.4rem;
        margin: 0;
      }

      .search-subtitle p {
        font-size: 1.2rem;
        flex-shrink: 0;
        margin: 0;
      }
    </style>

    <div class="search-bg" id="search-bg"></div>

    <div class="search-modal" id="search-modal">
      <div class="search-header"><p>検索</p></div>
      <div class="search-XButton"></div>
      <div class="search-box">
        <button aria-label="検索"></button>
        <input
          id="search-input"
          type="text"
          placeholder="検索キーワードを入力"
        />
      </div>
      <!-- <div class="search-subtitle"><p>検索結果(クリックして移動)</p></div> -->
      <div class="search-result" id="search-results"></div>
    </div>

    <template id="result-template">
      <div class="result-item">
        <div class="result-title">
        </div>
        <div class="result-detail">
        </div>
      </div>
    </template>
    `;

    const searchModalScript = document.createElement("script");
    searchModalScript.type = "module";
    searchModalScript.src = "/Student_Council/src/common/searchModal.js";
    this.appendChild(searchModalScript);

    // スクリプトのロード完了を待つ処理を追加
    searchModalScript.onload = () => {
      if (window.initializeSearchModal) {
        window.initializeSearchModal();
      } else {
        console.error("initializeSearchModal関数が見つかりません");
      }
    };
  }
}

customElements.define("common-searchmodal", SearchModal);

class Footer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = `
    <style>
      /* フッター部分 */
      footer {
        font-family: sans-serif;
        display: block;
        width: 100%;
        margin: 0;
        height: auto;
        box-sizing: border-box;
      }
      
      /* フッターのウェーブ */
      .footer-wave {
        width: 100%;
        height: auto;
      }

      .footer-wave img {
          display: block;
          position: relative;
          bottom: -1px;
          width: 100%;
          height: auto;
      }
      
      /* フッターのコンテンツ */
      .footer-content {
        background-color: #fba481;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: 30px;
        padding-bottom: 30px;
        text-align: center;
        width: 100%;
      }

      .footer-main {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 24px;
        margin: auto 20px;
        line-height: 1.5em;
      }

      /* ロゴの大きさ等 */
      .footer-logo {
        height: 80px;
        width: auto;
        cursor: default;
      }

      /* フッターの文字 */
      .footer-main h2 {
        font-size: 16px;
        font-weight: 400;
        margin: 0;
        text-align: left;
        word-break: auto-phrase;
      }

      .footer-links {
        display: flex;
        flex-direction: row;
        margin: 48px auto;
        gap: 32px;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
      }

      @media (max-width: 768px) {
        .footer-links {
          flex-direction: column;
        }
      }

      .footer-links a{
        color: #000;
        font-weight: bold;
        text-decoration: underline;
        font-size: 13px;
      }

      .footer-content h3 {
        font-size: 14px;
        margin: auto 20px;
      }
    }
    </style>

    <footer>

      <div class="footer-content">
        <div class="footer-main">
          <a class="logo-wrapper" href="/Student_Council/index.html">
            <img src="/aikon.png" alt="明和祭2025 企画アイコン" class="footer-logo">
          </a>
          <h2>愛知県立明和高等学校生徒会<br>TEL:052-961-2551<br>FAX:052-953-6348<br>〒461-0011 名古屋市東区白壁二丁目32番6号</h2>
        </div>
        <div class="footer-links">
          <a href="/School_Festival2025/">明和祭2025 ホームページ</a>
        </div>
        <h3>Copyright© Student Council of Meiwa High School All Rights Reserved.</h3>
      </div>
    </footer>
    `;
  }
}
customElements.define("common-footer", Footer);

// モバイルメニューのスクリプトを追加

// モバイルメニューのスクリプト部分（修正版）
document.addEventListener("DOMContentLoaded", function () {
  const menuIcon = document.querySelector(".menu-toggle .mobile-only");
  const menuBg = document.getElementById("mobile-menu-bg");
  const modal = document.getElementById("mobile-menu-modal");
  const closeBtn = document.getElementById("close-mobile-menu");
  const nav = document.getElementById("mobile-menu-nav");
  const headerNavItems = [
    { text: "お知らせ", href: "/Student_Council/news/" },
    { text: "学校案内", href: "/Student_Council/about/" },
    { text: "学校生活", href: "/Student_Council/school-life/" },
    { text: "生徒会活動", href: "/Student_Council/council/" },
    { text: "部活動", href: "/Student_Council/club/" },
    { text: "音楽科", href: "/Student_Council/music-class/" },
    { text: "明和語辞典", href: "/Student_Council/dictionary/" },
  ];

  function renderMobileMenu() {
    nav.innerHTML = "";
    headerNavItems.forEach((item, idx) => {
      const a = document.createElement("a");
      a.href = item.href;
      a.className = "mobile-menu-link-flex";
      const span = document.createElement("span");
      span.textContent = item.text;
      span.className = "mobile-menu-link-title";
      const img = document.createElement("img");
      const iconList = [
        "news-button-arrow",
        "about-button-arrow",
        "life-button-arrow",
        "council-button-arrow",
        "club-button-arrow",
        "music-button-arrow", // 音楽科
        "dictionary-button-arrow",
      ];
      const iconName = iconList[idx] || "arrow";
      img.src = `/Student_Council/src/images/${iconName}.svg`;
      img.alt = "arrow";
      img.className = "mobile-menu-arrow-img";
      a.appendChild(span);
      a.appendChild(img);
      const linkWrapper = document.createElement("div");
      linkWrapper.className = "mobile-menu-link-wrapper";
      linkWrapper.appendChild(a);
      nav.appendChild(linkWrapper);
    });
  }

  function showModal() {
    // 現在のスクロール位置を保存
    const scrollY = window.scrollY;
    document.body.dataset.scrollY = scrollY;

    // bodyのpositionをfixedにして、スクロール位置を維持
    // document.body.style.position = "fixed";
    // document.body.style.top = `-${scrollY}px`;
    // document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    menuBg.style.display = "block";
    modal.style.display = "flex";
    menuBg.classList.remove("fade-out");
    menuBg.classList.add("fade-in");
    modal.classList.remove("fade-out");
    modal.classList.add("fade-in");
  }

  function hideModal() {
    menuBg.classList.remove("fade-in");
    menuBg.classList.add("fade-out");
    modal.classList.remove("fade-in");
    modal.classList.add("fade-out");

    // 保存したスクロール位置を復元
    const scrollY = document.body.dataset.scrollY;

    // bodyのスタイルをリセット
    // document.body.style.position = "";
    // document.body.style.top = "";
    // document.body.style.width = "";
    document.body.style.overflow = "";

    // スクロール位置を復元
    if (scrollY !== undefined) {
      window.scrollTo(0, parseInt(scrollY || "0"));
      document.body.removeAttribute("data-scroll-y");
    }

    // アニメーション完了後に非表示
    setTimeout(() => {
      menuBg.style.display = "none";
      modal.style.display = "none";
    }, 200);
  }

  if (menuIcon && menuBg && modal && closeBtn && nav) {
    // メニューアイコンクリックで表示
    menuIcon.addEventListener("click", (e) => {
      e.preventDefault();
      renderMobileMenu();
      showModal();
    });

    // 閉じるボタンクリック
    closeBtn.addEventListener("click", hideModal);

    // モーダル自体のクリックイベントで背景クリックを検出
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        hideModal();
      }
    });

    // 追加の安全策として背景要素にもリスナーを設定
    menuBg.addEventListener("click", function (event) {
      if (event.target === menuBg) {
        hideModal();
      }
    });

    // modal-content内のクリックがモーダルに伝播しないようにする
    const modalContent = modal.querySelector(".modal-content");
    if (modalContent) {
      modalContent.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    }

    // Escキーで閉じる
    document.addEventListener("keydown", (e) => {
      if (
        modal.style.display === "flex" &&
        (e.key === "Escape" || e.key === "Esc")
      ) {
        hideModal();
      }
    });
  } else {
    console.error("モバイルメニューの要素が見つかりません");
  }
});

// モーダル
function getScrollbarWidth() {
  const div = document.createElement("div");

  // スクロールバーを強制表示しつつ、表示されないように位置設定
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.overflow = "scroll";
  div.style.position = "absolute";
  div.style.top = "-9999px";

  document.body.appendChild(div);

  const scrollbarWidth = div.offsetWidth - div.clientWidth;

  document.body.removeChild(div);
  return scrollbarWidth;
}

function openModal(id) {
  const modalDiv = document.getElementById("common-modal-container");
  const modalBgDiv = document.getElementById("common-modal-bg");

  document.body.style.overflow = "hidden";
  const scrollbarWidth = getScrollbarWidth();
  console.log("scrollbarWidth", scrollbarWidth);
  document.getElementById(
    "common-header"
  ).style.width = `calc(100% - ${scrollbarWidth}px)`;
  document.body.style.paddingRight = scrollbarWidth + "px";

  modalDiv.style.display = "block";
  modalBgDiv.style.display = "block";
  modalDiv.classList.remove("fade-out");
  modalDiv.classList.add("fade-in");
  modalBgDiv.classList.remove("fade-out");
  modalBgDiv.classList.add("fade-in");
  refreshModalData(id);
}

function closeModal() {
  const modalDiv = document.getElementById("common-modal-container");
  const modalBgDiv = document.getElementById("common-modal-bg");

  modalDiv.classList.remove("fade-in");
  modalDiv.classList.add("fade-out");
  modalBgDiv.classList.remove("fade-in");
  modalBgDiv.classList.add("fade-out");

  // location.href = "" してしまうと、画面上部に戻されてしまうので、URLを上書きする
  // history.pushState(
  //   "",
  //   document.title,
  //   window.location.pathname + window.location.search
  // );

  // フェードアウト後に完全に隠す
  setTimeout(() => {
    modalDiv.style.display = "none";
    modalBgDiv.style.display = "none";

    document.getElementById("common-header").style.width = `100%`;
    document.body.style.overflow = null;
    document.body.style.paddingRight = null;
  }, 100); // アニメーション時間に合わせる
}

class Modal extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = `
    <div id="common-modal-bg" class="common-modal-hidden"></div>
    <div id="common-modal-container" class="common-modal-hidden"><div id="common-modal-wrapper"></div></div>
     `;
  }
}

customElements.define("common-modal", Modal);

document.addEventListener("DOMContentLoaded", () => {
  const modalContainerDiv = document.getElementById("common-modal-container");
  const modalWrapperDiv = document.getElementById("common-modal-wrapper");
  const modalBgDiv = document.getElementById("common-modal-bg");

  modalBgDiv.addEventListener("click", function (e) {
    closeModal();
  });

  document.querySelectorAll(".common-modal-trigger").forEach((clickEl) => {
    clickEl.addEventListener("click", function () {
      const contentEl = this.nextElementSibling; // すぐ下の隣接要素
      // `.common-modal-container` を取得
      const container = contentEl.classList.contains("common-modal-content");
      if (container) {
        // 中身をコピー
        console.log("モーダルを開く");
        modalWrapperDiv.innerHTML = contentEl.innerHTML;
        openModal();
      }
    });
  });
});

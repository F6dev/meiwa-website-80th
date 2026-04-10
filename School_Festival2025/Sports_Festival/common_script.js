document.addEventListener("DOMContentLoaded", () => {
  class Header extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.innerHTML = `
        <style>
          :host {
            --header-height: 70px;
            display: block;
          }

          header {
            font-family: sans-serif;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 50px;
            background-color: rgba(255, 245, 233, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 8px;
            box-sizing: border-box;
            border-radius: 0 0 15px 15px;
            z-index: 998;
          }

          .logo img {
            height: 45px;
          }

          /* PC用ナビ */
          nav {
            display: flex;
            gap: 20px;
          }

          nav a {
            text-decoration: none;
            color: #333;
            font-size: 1rem;
            padding: 0.5em;
            border-radius: 6px;
            transition: background .2s, transform .2s;
          }

          nav a:hover {
            background: rgba(0,0,0,0.05);
            transform: translateY(-2px);
          }

          /* ハンバーガーメニュー */
          .menu-toggle {
            display: none;
            cursor: pointer;
          }

          .menu-toggle img {
            width: 28px;
            height: 28px;
          }

          @media (max-width: 940px) {
            nav { display: none; }
            .menu-toggle { display: inline-flex; }
          }

          /* モバイルメニュー背景 */
          .mobile-menu-bg {
            width: 100vw;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 999;
          }

          /* モバイルメニュー本体 */
          .mobile-menu-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80vw;
            max-width: 400px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            padding: 20px;
            display: none;
            z-index: 1000;
            max-height: 80vh;
            overflow-y: auto;
          }

          .mobile-menu-title {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 1em;
            text-align: center;
          }

          .mobile-menu-link {
            display: block;
            padding: 12px;
            border-bottom: 1px solid #eee;
            text-decoration: none;
            color: #333;
            font-size: 1rem;
          }

          .mobile-menu-link:hover {
            background: rgba(0,0,0,0.05);
          }

          .close {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 1.5rem;
            cursor: pointer;
          }

          .logo p:hover {
            color: #94541c !important;
            border-bottom: 1px solid #94541c;
          }

          .logo p {
            color: rgb(68, 43, 19) !important;
            text-decoration: none !important;
            border-bottom: 1px dotted #77481e;
          }
          
          .logo a {
            text-decoration: none !important;
          }

          .logo {
            text-decoration: none !important;
          }
        </style>

        <header id="common-header">
          <a class="logo" href="/School_Festival2025" style="display: flex; align-items: center;">
            <img src="/School_Festival2025/src/img/aikon.png" alt="明和祭2025 アイコン"><p>明和祭トップに戻る</p>
          </a>
          <nav>
            <a href="#program">プログラム</a>
            <a href="#venue">会場案内</a>
            <a href="#blocks">ブロック紹介</a>
            <a href="#modal">競技ルール</a>
            <a href="#gallery">ギャラリー</a>
            <a href="#results">体育祭結果</a>
          </nav>
          <div class="menu-toggle">
            <img src="./menu.png" alt="Menu">
          </div>
        </header>

        <!-- モバイルメニュー背景 -->
        <div class="mobile-menu-bg"></div>

        <!-- モバイルメニュー本体 -->
        <div class="mobile-menu-modal">
          <span class="close">&times;</span>
          <div class="mobile-menu-title">Menu</div>
          <a href="#program" class="mobile-menu-link">プログラム</a>
          <a href="#venue" class="mobile-menu-link">会場案内</a>
          <a href="#blocks" class="mobile-menu-link">ブロック紹介</a>
          <a href="#modal" class="mobile-menu-link">競技ルール</a>
          <a href="#gallery" class="mobile-menu-link">ギャラリー</a>
          <a href="#results" class="mobile-menu-link">体育祭結果</a>
        </div>
      `;

      // ===== JS処理 =====
      const menuBtn = this.querySelector(".menu-toggle");
      const modal = this.querySelector(".mobile-menu-modal");
      const bg = this.querySelector(".mobile-menu-bg");
      const closeBtn = this.querySelector(".close");

      const openMenu = () => {
        modal.style.display = "block";
        bg.style.display = "block";
        document.body.style.overflow = "hidden";
      };

      const closeMenu = () => {
        modal.style.display = "none";
        bg.style.display = "none";
        document.body.style.overflow = "";
      };

      menuBtn.addEventListener("click", openMenu);
      closeBtn.addEventListener("click", closeMenu);
      bg.addEventListener("click", closeMenu);

      // メニュー内リンクを押したら閉じる
      this.querySelectorAll(".mobile-menu-link").forEach((link) => {
        link.addEventListener("click", closeMenu);
      });
    }
  }

  // 🔹 ここを変更（旧: "common-header"）
  customElements.define("site-header", Header);
});

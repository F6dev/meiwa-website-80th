class Header extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <style>
                header {
                    width: 99%;
                    left: 0.5%;
                    position: fixed;
                    display: flex;
                    border-radius: 5px 5px 15px 15px;
                    z-index: 1000;
                    background-color: rgba(255, 253, 252, 0.9);
                    height: 70px;
                }

                .logo {
                    position: relative;
                    width: auto;
                    padding: 5px;
                    margin: 0 5px;
                    cursor: pointer;
                    margin-left: 10px;
                }

                .logo a {
                    display: block;
                }

                .logo img {
                    height: 60px;
                    display: block;
                }

                .logo-border {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    overflow: visible;
                }

                .logo-border rect {
                    fill: none;
                    stroke: #000;
                    stroke-width: 1.75;
                    stroke-dasharray: 900;   /* 周囲の長さ: 2*(356+88) - 8*10 + 2π*10 ≈ 871 */
                    stroke-dashoffset: 900;
                    transition: stroke-dashoffset 0.6s cubic-bezier(0.8, 0.05, 0.05, 0.8); /* https://easingwizard.com/ */
                }

                .logo:hover .logo-border rect {
                    stroke-dashoffset: 0;
                }
                    
                .nav-links {
                    width: 100%;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    margin-right: 20px;
                    border-radius: 8px;
                }

                .nav-links nav {
                    display: flex;
                    gap: 12px;
                }

                .nav-links a {
                    color: #000;
                    text-decoration: none;
                    padding: 2em 0.5em;
                    background-image: linear-gradient(var(--underline-color), var(--underline-color)); /* あとから指定する色の背景、つまり線にする */
                    background-repeat: no-repeat;
                    background-position: left 75%;
                    background-size: 0% 2px; /* ホバーした瞬間の線の太さ */
                    transition: background-size 0.3s cubic-bezier(0.8, 0.05, 0.05, 0.8); /* https://easingwizard.com/ */
                }

                .nav-links a:hover {
                    background-size: 100% 2px; /* アニメーション終了時の線の太さ */
                }

                /* それぞれのリンクの色の指定 */
                .nav-link-news {--underline-color: #D38D5F;}

                .nav-link-about {--underline-color: #FFC069;}

                .nav-link-school-life {--underline-color: #F19CAE}

                .nav-link-council {--underline-color: #15A9D0;}

                .nav-link-club {--underline-color: #11A190;}

                .nav-link-music-class {--underline-color: #9696e5;}

                .nav-link-dictionary {--underline-color: #1D77C7;}

                .mode-toggle {
                    text-align: center;
                    align-items: center;
                    margin-top: auto;
                    margin-bottom: auto;
                    margin-left: 16px;
                }

                .mode-toggle img {
                    text-align: center;
                    align-items: center;
                    margin: 0 auto;
                }
            </style>

            <header>
                <div class="logo">
                    <a href="/Student_Council/">
                        <img src="/Student_Council/src/images/meiwa-logo.svg">
                    </a>
                    <svg class="logo-border" viewBox="0 0 360 92" preserveAspectRatio="none">
                        <rect x="2" y="2" width="356" height="88" rx="10" ry="10" fill="none"/>
                    </svg>
                </div>
                <div class="nav-links">
                    <nav>
                        <a href="/Student_Council/news/" class="nav-link-news">お知らせ</a>
                        <a href="/Student_Council/about/" class="nav-link-about">学校案内</a>
                        <a href="/Student_Council/school-life/" class="nav-link-school-life">学校生活</a>
                        <a href="/Student_Council/council/" class="nav-link-council">生徒会活動</a>
                        <a href="/Student_Council/club/" class="nav-link-club">部活動</a>
                        <a href="/Student_Council/music-class/" class="nav-link-music-class">音楽科</a>
                        <a href="/Student_Council/dictionary/" class="nav-link-dictionary">明和語辞典</a>
                        <a href="https://github.com/F6dev/meiwa-website-80th">その他</a>
                    </nav>
                </div>
            </header>
        `
    };
}

customElements.define('common-header', Header)

class Footer extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
    <style>
        footer {
            margin-top: 50px;
            width: 100%; 
        }

        .footer-wave {
            width: 100%;
            height: auto;
        }

        .footer-wave img {
            width: 100%;
            height: auto;
            position: relative;
            bottom: -3px;
        }

        .footer-contents {
            background-color: #FFC069;
            width: 100%;
            margin: 0 auto;
            padding-top: 1px;
            padding-bottom: 1px;
        }

        .footer-main{
            display: flex;
            justify-content: center;
            margin-top: 40px;
            margin-bottom: 20px;
            gap: 20px;
        }

        .footer-logo img {
            height: 80px;
            width: auto;
        }

        .footer-logo a {
            cursor: default;
        }

        .footer-info {
            line-height: 1.5;
            align-items: center;
        }

        .footer-info p {
            margin: 0;
            font-weight: 200;
        }

        .footer-info-contact p {
            font-size: 14px;
        }

        .footer-divider {
            width: 90%;
            margin: 0 auto;
            height: 1px;
            background-color: rgba(0, 0, 0, 0.2);
            margin-bottom: 40px;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 32px;
        }

        .footer-links a {
            font-size: 14px;
            color: #000;
            text-decoration: underline dashed 1px;
            text-underline-offset: 4px;
            font-weight: 900;
        }

        .footer-links a:hover {
            text-decoration: underline 1px;
        }

        .footer-copyright {
            text-align: center;
            margin-top: 48px;
            margin-bottom: 36px;
        }
    </style>

    <footer>
        <div class="footer-wave">
            <img src="/Student_Council/src/images/footer/footer-wave.png" alt="">
        </div>
        <div class="footer-contents">
            <div class="footer-main">
                <div class="footer-logo">
                    <a href="/Student_Council/">
                        <img src="/Student_Council/src/images/footer/footer-logo.svg" alt="">
                    </a>
                </div>
                <div class="footer-info">
                    <div class="footer-info-title">
                        <p>
                            愛知県立明和高等学校生徒会
                        </p>
                    </div>
                    <div class="footer-info-contact">
                        <p>
                            TEL:052-961-2551 / FAX:052-953-6348<br>〒461-0011 名古屋市東区白壁二丁目32番6号
                        </p>
                    </div>
                </div>
            </div>
            <div class="footer-divider"></div>
            <div class="footer-links">
                <a href="/School_Festival2025/">明和祭2026 ホームページ</a>
                <a href="https://guest.meiwa.website">明和祭2026 学校説明会席予約システム</a>
                <a href="https://meiwa-h.aichi-c.ed.jp/cms/">明和高等学校公式ホームページ</a>
                <a href="/Student_Council/sitemap/">サイトマップ</a>
                <a href="/Student_Council/site-policy/">サイトポリシー</a>
            </div>
            <div class="footer-copyright">
                <p>Copyright© Student Council of Meiwa High School All Rights Reserved.</p>
            </div>
        </div>
    </footer>
    `;
    }
}
customElements.define("common-footer", Footer);

// ========== サブページ サイドバー ==========

let lastCheckTime = 0;
const CHECK_INTERVAL = 500;
let activeSectionId = null;

function getHeaderHeight() {
  const menu = document.getElementById("subpage-sidebar");
  if (window.innerWidth >= 940 || !menu) {
    const header = document.querySelector("header");
    return header ? header.offsetHeight + 10 : 0;
  } else {
    return menu.getBoundingClientRect().top + menu.offsetHeight + 40;
  }
}

function checkActiveSection() {
  const now = Date.now();
  if (now - lastCheckTime < CHECK_INTERVAL) {
    requestAnimationFrame(checkActiveSection);
    return;
  }
  lastCheckTime = now;

  const headerHeight = getHeaderHeight();
  let topSection = null;
  let maxTop = -Infinity;

  document.querySelectorAll("section").forEach((section) => {
    if (section.dataset.navVisible != "true") return;
    const rect = section.getBoundingClientRect();
    if (rect.top <= headerHeight && rect.bottom > 0 && rect.top > maxTop) {
      maxTop = rect.top;
      topSection = section;
    }
  });

  if (topSection && (!activeSectionId || topSection.id !== activeSectionId)) {
    document.querySelectorAll("#sidebar-box li").forEach((item) => {
      item.classList.remove("sidebar-item-active");
    });

    activeSectionId = topSection.id;
    const targetLink = document.querySelector(
      `#sidebar-box a[href="#${activeSectionId}"]`
    );

    if (targetLink) {
      const sidebarItem = targetLink.parentElement;
      sidebarItem.classList.add("sidebar-item-active");

      // スマホ時、アクティブ項目が見切れないようにスクロール
      const container = document.getElementById("sidebar-box");
      const el = document.querySelector(".sidebar-item-active");
      const offsetPx = 12;

      if (el && container) {
        const visibleLeft = container.scrollLeft;
        const visibleRight = visibleLeft + container.clientWidth;
        const elLeft = el.offsetLeft;
        const elRight = elLeft + el.offsetWidth;

        if (elRight > visibleRight) {
          container.scrollTo({ left: elRight - container.clientWidth + offsetPx, behavior: "smooth" });
        } else if (elLeft < visibleLeft) {
          container.scrollTo({ left: elLeft - offsetPx, behavior: "smooth" });
        }
      }
    }
  }

  requestAnimationFrame(checkActiveSection);
}

function createSidebarItem(id, label, href) {
  return `
    <li id="${id}-nav">
      <a href="${href}"><span>${label}</span></a>
    </li>
  `;
}

function updateSidebar() {
  const sidebarUl = document.querySelector("#sidebar-box ul");
  if (!sidebarUl) return;

  sidebarUl.innerHTML = "";

  document.querySelectorAll("section").forEach((section) => {
    const id = section.id;
    const label = section.dataset.label?.trim() || id;
    const visible = section.dataset.navVisible !== "false";
    const preferHref = section.dataset.preferHref;

    if (!id || !label || !visible) return;

    const href = preferHref || `#${id}`;
    sidebarUl.insertAdjacentHTML("beforeend", createSidebarItem(id, label, href));
  });
}

window.updateSidebar = updateSidebar;

document.addEventListener("DOMContentLoaded", () => {
  updateSidebar();
  // サイドバーがあるページのみアクティブ監視を起動
  if (document.getElementById("sidebar-box")) {
    requestAnimationFrame(checkActiveSection);
  }
});
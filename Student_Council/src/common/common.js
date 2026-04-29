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
                    margin-right: 2em;
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
                        <a href="">その他</a>
                    </nav>
                </div>
            </header>
        `
    };
}

customElements.define('common-header', Header)
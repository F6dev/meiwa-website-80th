class Header extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <style>
                header {
                    width: 100%;
                    position: fixed;    
                    display: flex;
                    border-radius: 0 0 15px 15px;
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
                    background: transparent; /* 明示的に透明に */
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
                    display: block; /* inlineだと余白が出ることがある */
                }

                .logo-border rect {
                    fill: none;
                    stroke: #000;
                    stroke-width: 1.5;
                    stroke-dasharray: 900;   /* 周囲の長さ: 2*(356+88) - 8*10 + 2π*10 ≈ 871 */
                    stroke-dashoffset: 900;
                    transition: stroke-dashoffset 0.6s cubic-bezier(0.8, 0.05, 0.05, 0.8);
                }

                .logo:hover .logo-border rect {
                    stroke-dashoffset: 0;
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
                    <a href="/Student_Council/news/">お知らせ</a>
                    <a href="/Student_Council/about/">学校案内</a>
                    <a href="/Student_Council/school-life/">学校生活</a>
                    <a href="/Student_Council/council/">生徒会活動</a>
                    <a href="/Student_Council/club/">部活動</a>
                    <a href="/Student_Council/music-class/">音楽科</a>
                    <a href="/Student_Council/dictionary/">明和語辞典</a>
                    <a href="">その他</a>
                </div>
            </header>
        `
    };
}

customElements.define('common-header', Header)
class Header extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <style>

            </style>

            <header id="common-header>
                <div class="logo">
                    <a href="/Student_Council/">
                        <img src="/Student_Council/src/images/meiwa-logo.svg">
                    </a>
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

customElements.define(`common-header`, Header)

class Footer extends HTMLElement {
    connectedCallback() {
        this.innerHTML = ``
    };
}

customElements.define(`common-footer`, Footer)
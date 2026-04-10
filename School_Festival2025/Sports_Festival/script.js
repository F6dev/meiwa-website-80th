// AjaxをVanillaJSに変換した

document.addEventListener("DOMContentLoaded", function () {
  // ブロック詳細表示（1つだけ開く）
  const cards = document.querySelectorAll(".block-card");
  cards.forEach((card) => {
    const header = card.querySelector("h3");
    header.addEventListener("click", () => {
      // 他のカードを閉じる
      cards.forEach((c) => {
        if (c !== card) {
          c.classList.remove("active");
          c.querySelector(".toggle-icon").textContent = "＋";
        }
      });

      // 今クリックしたカードをトグル
      card.classList.toggle("active");
      const icon = card.querySelector(".toggle-icon");
      icon.textContent = card.classList.contains("active") ? "×" : "＋";
    });
  });

  // スムーズスクロール
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 60,
          behavior: "smooth",
        });
      }
    });
  });

  // プログラムモーダル表示
  document.querySelectorAll(".program-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";

      const content = document.createElement("div");
      content.className = "modal-content";

      const closeBtn = document.createElement("span");
      closeBtn.className = "modal-close";
      closeBtn.innerHTML = "&times;";

      const img = document.createElement("img");
      img.src = "timetable.png";
      img.alt = "タイムテーブル";
      img.style.width = "100%";

      content.appendChild(closeBtn);
      content.appendChild(img);
      overlay.appendChild(content);
      document.body.appendChild(overlay);

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay || e.target === closeBtn) {
          overlay.remove();
        }
      });
    });
  });

  // 競技ルールの詳細表示（1つだけ開く）
  document.querySelectorAll(".rule-show-more-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const details = this.nextElementSibling;

      // 他の詳細を閉じる
      document.querySelectorAll(".rule-details").forEach((d) => {
        if (d !== details) {
          d.classList.remove("active");
          d.previousElementSibling.textContent = "ルールを見る";
        }
      });

      // 今クリックしたボタンの詳細をトグル
      const isActive = details.classList.toggle("active");
      this.textContent = isActive ? "閉じる" : "ルールを見る";
    });
  });

  // ハンバーガーメニュー
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
      this.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // 競技ルール：モーダル表示（スクロール固定付き）
  let scrollY = 0;
  const ruleModal = document.getElementById("rule-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalText = document.getElementById("modal-text");
  const closeBtn = document.querySelector(".close-btn");

  function openModal() {
    scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    const scrollbarWidth = getScrollbarWidth();
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    const header = document.getElementById("common-header");
    if (header) {
      header.style.width = `calc(100% - ${scrollbarWidth}px)`;
    }

    ruleModal.style.display = "flex";
  }

  function closeModal() {
    ruleModal.style.display = "none";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.paddingRight = "";

    const header = document.getElementById("common-header");
    if (header) header.style.width = "";

    window.scrollTo(0, scrollY);
  }

  function getScrollbarWidth() {
    const div = document.createElement("div");
    div.style.visibility = "hidden";
    div.style.overflow = "scroll";
    div.style.position = "absolute";
    div.style.width = "100px";
    document.body.appendChild(div);

    const innerDiv = document.createElement("div");
    innerDiv.style.width = "100%";
    div.appendChild(innerDiv);

    const scrollbarWidth = div.offsetWidth - innerDiv.offsetWidth;
    document.body.removeChild(div);
    return scrollbarWidth;
  }

  document.querySelectorAll(".rule-icon").forEach((icon) => {
    icon.addEventListener("click", function () {
      modalTitle.textContent = icon.nextElementSibling.textContent;
      modalText.textContent = icon.dataset.rule;
      openModal();
    });
  });

  closeBtn?.addEventListener("click", closeModal);
  ruleModal?.addEventListener("click", (e) => {
    if (e.target === ruleModal) {
      closeModal();
    }
  });

  // 画像拡大モーダル
  const imageModal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const caption = document.getElementById("caption");

  document.querySelectorAll(".clickable-img").forEach((img) => {
    img.addEventListener("click", function () {
      imageModal.style.display = "block";
      modalImg.src = this.src;
      caption.textContent = this.alt;
    });
  });

  imageModal?.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.style.display = "none";
    }
  });

  // カルーセル（スライド式）
  const carouselSlides = document.querySelector(".slides");
  const slideElements = document.querySelectorAll(".slide");
  if (carouselSlides && slideElements.length > 0) {
    // クローン追加
    const firstClone = slideElements[0].cloneNode(true);
    const lastClone = slideElements[slideElements.length - 1].cloneNode(true);
    carouselSlides.appendChild(firstClone);
    carouselSlides.insertBefore(lastClone, slideElements[0]);

    let slideIndex = 1;
    let isTransitioning = false;
    let slideWidth = slideElements[0].clientWidth;

    // 初期位置セット
    carouselSlides.style.transform = `translateX(-${
      slideWidth * slideIndex
    }px)`;

    // リサイズ対応
    window.addEventListener("resize", () => {
      slideWidth = slideElements[0].clientWidth;
      carouselSlides.style.transition = "none";
      carouselSlides.style.transform = `translateX(-${
        slideWidth * slideIndex
      }px)`;
    });

    // ドット生成
    const dotsContainer = document.querySelector(".dots");
    if (dotsContainer) {
      for (let i = 0; i < slideElements.length; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => {
          moveToSlide(i + 1);
        });
        dotsContainer.appendChild(dot);
      }
    }
    const dots = document.querySelectorAll(".dot");

    function updateDots() {
      dots.forEach((dot) => dot.classList.remove("active"));
      dots[
        (slideIndex - 1 + slideElements.length) % slideElements.length
      ].classList.add("active");
    }

    function moveToSlide(index) {
      if (isTransitioning) return;
      isTransitioning = true;
      carouselSlides.style.transition = "transform 0.5s ease-in-out";
      carouselSlides.style.transform = `translateX(-${slideWidth * index}px)`;
      slideIndex = index;
    }

    // ボタン操作
    document.querySelector(".next")?.addEventListener("click", () => {
      moveToSlide(slideIndex + 1);
    });

    document.querySelector(".prev")?.addEventListener("click", () => {
      moveToSlide(slideIndex - 1);
    });

    // トランジション終了処理
    carouselSlides.addEventListener("transitionend", () => {
      isTransitioning = false;
      if (slideIndex === 0) {
        carouselSlides.style.transition = "none";
        slideIndex = slideElements.length;
        carouselSlides.style.transform = `translateX(-${
          slideWidth * slideIndex
        }px)`;
      }
      if (slideIndex === slideElements.length + 1) {
        carouselSlides.style.transition = "none";
        slideIndex = 1;
        carouselSlides.style.transform = `translateX(-${
          slideWidth * slideIndex
        }px)`;
      }
      updateDots();
    });

    // スワイプ操作
    let startX = 0;
    carouselSlides.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });
    carouselSlides.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) {
        moveToSlide(slideIndex + 1);
      }
      if (endX - startX > 50) {
        moveToSlide(slideIndex - 1);
      }
    });
  }

  // カルーセル（スクロール式）
  const viewport = document.getElementById("carousel__viewport");
  const items = document.querySelectorAll(".carousel__slide");
  const prevBtn = document.getElementById("carousel-button-prev");
  const nextBtn = document.getElementById("carousel-button-next");

  if (viewport && items.length > 0) {
    let nowID = 0;

    function moveToCarouselItem(id) {
      viewport.scrollTo({
        behavior: "smooth",
        left: items[id].offsetLeft,
      });
    }

    nextBtn?.addEventListener("click", () => {
      nowID = (nowID + 1) % items.length;
      moveToCarouselItem(nowID);
    });

    prevBtn?.addEventListener("click", () => {
      nowID = (nowID - 1 + items.length) % items.length;
      moveToCarouselItem(nowID);
    });
  }
});

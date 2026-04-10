// V.2.0

// デバイスタイプ判定（画面サイズベース）
function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width >= 768 && width <= 1023) return "tablet";
  return "desktop";
}

// 動画要素の作成
function createVideoElement() {
  const video = document.createElement("video");
  video.id = "hero-video";
  video.autoplay = true;
  video.controls = false;
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.controls = false;
  video.controlslist = "nodownload nofullscreen noremoteplayback";
  video.disablePictureInPicture = true;

  // ループするかどうか
  video.loop = false;

  const device = getDeviceType();
  if (device === "mobile") {
    console.info("mobile");
    video.className = "rv video-mobile";
    // video.poster = "picture/poster-mobile.jpg";
    video.innerHTML = `<source src="picture/meiwa festival.mp4" type="video/mp4">`;
    video.style.display = "block";
  } else if (device === "tablet") {
    console.info("tablet");
    video.className = "rv video-tablet";
    // video.poster = "picture/poster-tablet.jpg";
    video.innerHTML = `<source src="picture/明和祭2025.mp4" type="video/mp4">`;
    video.style.display = "block";
  } else {
    console.info("else");
    video.className = "rv video-desktop";
    // video.poster = "picture/poster-desktop.jpg";
    video.innerHTML = `<source src="picture/明和祭2025.mp4" type="video/mp4">`;
    video.style.display = "block";
  }

  // 再生終了時にクリックで頭出しできるようにする
  video.addEventListener("click", () => {
    if (video.ended) {
      video.currentTime = 0;
      video.play();
    }
  });

  return video;
}

// 動画の更新処理
function updateVideo() {
  // ヘッダー分空白を入れているが、強制的に消す
  document.body.style.marginTop = 0;

  const container = document.querySelector("#video-container");
  if (!container) return;

  // 追加: #hero-video 要素のクラス名に基づく条件分岐
  const heroVideo = document.getElementById("hero-video");
  let initMode;
  if (heroVideo) {
    if (heroVideo.classList.contains("video-mobile")) {
      initMode = "mobile";
    } else if (heroVideo.classList.contains("video-tablet")) {
      initMode = "tablet";
    } else if (heroVideo.classList.contains("video-desktop")) {
      initMode = "desktop";
    }
  }

  if (initMode == getDeviceType()) {
    console.log("表示モード一致");
    return;
  }

  container.innerHTML = "";
  const newVideo = createVideoElement();
  container.appendChild(newVideo);

  // 自動再生フォールバック
  newVideo.play().catch((e) => {
    console.log("Autoplay prevented, enabling controls");
    newVideo.controls = true;
    newVideo.muted = false;
  });

  setTimeout(() => {
    document.getElementById("hero").style.height = "100svh";
  }, 500);
}

// リサイズデバウンス
function debounce(func, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(func, delay);
  };
}

// 初期化
document.addEventListener("DOMContentLoaded", () => {
  updateVideo();
  window.addEventListener("resize", debounce(updateVideo, 250));
});

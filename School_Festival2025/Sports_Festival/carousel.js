document.addEventListener("DOMContentLoaded", function () {
  const target = document.getElementById("carousel-test");

  target.addEventListener("click", function () {
    // クリックされたときの処理
    console.log("クリックされました！");
  });

  let nowID = 0;
  const items = document.querySelectorAll(".carousel__slide");
  setInterval(() => {
    if (nowID == items.length - 1) {
      nowID = 0;
    } else {
      nowID += 1;
    }
    moveToCarouselItem(items, nowID);
  }, 2000);
});

function moveToCarouselItem(items, id) {
  document.getElementById("carousel__viewport").scrollTo({
    behavior: "smooth",
    left: items[id].offsetLeft,
  });
}


// nowID = nowID - 1
// moveToCarouselItem(nowID)
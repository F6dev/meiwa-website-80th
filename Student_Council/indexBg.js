const hero = document.querySelector('.top-hero');
const h = new Date().getHours();
    if (h >= 6 && h < 16)        hero.classList.add('daytime');
    else if (h >= 16 && h < 19)  hero.classList.add('sunset');
    else                          hero.classList.add('night');
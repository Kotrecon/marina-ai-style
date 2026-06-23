// Управление активным пунктом меню
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");

  // Функция для установки активного пункта
  function setActiveLink(hash) {
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === hash) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // При клике на ссылку
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = link.getAttribute("href");
      setActiveLink(hash);

      // Сохраняем в localStorage
      localStorage.setItem("activeNav", hash);
    });
  });

  // При загрузке страницы
  const savedHash = localStorage.getItem("activeNav");
  const currentHash = window.location.hash || savedHash || "#colors";

  if (savedHash || window.location.hash) {
    setActiveLink(currentHash);
  } else {
    // По умолчанию активируем первый пункт
    setActiveLink("#colors");
  }

  // При изменении hash в URL
  window.addEventListener("hashchange", () => {
    setActiveLink(window.location.hash);
  });

  const sidebar = document.querySelector(".sidebar");

  // Сохраняем позицию скролла сайдбара при прокрутке
  if (sidebar) {
    sidebar.addEventListener("scroll", () => {
      sessionStorage.setItem("sidebarScrollPos", sidebar.scrollTop);
    });

    // Восстанавливаем позицию при загрузке страницы
    window.addEventListener("load", () => {
      const savedPos = sessionStorage.getItem("sidebarScrollPos");
      if (savedPos) {
        sidebar.scrollTop = parseInt(savedPos, 10);
      }
    });
  }
});

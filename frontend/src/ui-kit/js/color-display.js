// Автоматическое отображение реальных цветов
document.addEventListener("DOMContentLoaded", () => {
  const swatches = document.querySelectorAll(".swatch");

  swatches.forEach((swatch) => {
    const colorElement = swatch.querySelector(".color");
    const hexElement = swatch.querySelector(".hex");

    if (colorElement && hexElement) {
      // Получаем вычисленный цвет
      const computedStyle = window.getComputedStyle(colorElement);
      const backgroundColor = computedStyle.backgroundColor;

      // Конвертируем RGB в HEX
      const hex = rgbToHex(backgroundColor);
      hexElement.textContent = hex;
    }
  });

  function rgbToHex(rgb) {
    if (rgb.startsWith("#")) return rgb;

    const match = rgb.match(/\d+/g);
    if (!match) return rgb;

    const [r, g, b] = match.map(Number);
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }
});

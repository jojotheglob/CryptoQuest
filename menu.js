document.addEventListener("DOMContentLoaded", () => {
  const key = "cq_highestUnlocked";
  const highestUnlocked = parseInt(localStorage.getItem(key) || "1", 10);

  const hexes = document.querySelectorAll(".hex-link");

  hexes.forEach((hex) => {
    const level = parseInt(hex.dataset.level, 10);
    if (Number.isNaN(level)) return;

    if (level > highestUnlocked) {
      // lock this level
      hex.classList.add("locked");
      hex.setAttribute(
        "title",
        `Locked – complete Level ${level - 1} to unlock`
      );

      // prevent navigation
      hex.addEventListener("click", (e) => {
        e.preventDefault();
      });
    }
  });

  // Reset progress button
  const resetBtn = document.getElementById("reset-progress");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(key);
      location.reload(); // reload so menu updates to only Level 1 unlocked
    });
  }
});

(() => {
  const saved = localStorage.getItem("artTheme") || "dark";
  document.documentElement.dataset.theme = saved;
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.textContent = saved === "light" ? "☾" : "☀";
    btn.title = saved === "light" ? "Switch to Royal Night Theme" : "Switch to Royal Parchment Theme";
    btn.onclick = () => {
      const isLight = document.documentElement.dataset.theme === "light";
      const nextTheme = isLight ? "dark" : "light";
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("artTheme", nextTheme);
      btn.textContent = nextTheme === "light" ? "☾" : "☀";
      btn.title = nextTheme === "light" ? "Switch to Royal Night Theme" : "Switch to Royal Parchment Theme";
    };
  }
})();


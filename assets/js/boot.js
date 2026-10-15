/* Runs before first paint: marks that JavaScript is on (so reveal-on-scroll may hide content) and applies the saved theme. */
document.documentElement.className += " js";
try { var t = localStorage.getItem("ht-theme"); if (t) document.documentElement.setAttribute("data-theme", t); } catch (e) { /* private mode */ }

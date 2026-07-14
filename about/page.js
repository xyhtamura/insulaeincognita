(() => {
  "use strict";

  const progressBar = document.getElementById("reading-progress-bar");
  const updateProgress = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = height > 0 ? Math.min(1, window.scrollY / height) : 0;
    progressBar.style.width = `${progress * 100}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });

  const sections = [...document.querySelectorAll(".exegesis > section[id]")];
  const contentsLinks = [...document.querySelectorAll(".contents a[href^='#']")];
  const linkById = new Map(contentsLinks.map((link) => [link.hash.slice(1), link]));

  if (!("IntersectionObserver" in window)) return;

  const visible = new Map();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => visible.set(entry.target.id, entry));
    const current = [...visible.values()]
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

    contentsLinks.forEach((link) => link.classList.remove("is-current"));
    if (current && linkById.has(current.target.id)) {
      linkById.get(current.target.id).classList.add("is-current");
    }
  }, { rootMargin: "-12% 0px -72% 0px", threshold: [0, .1] });

  sections.forEach((section) => observer.observe(section));
})();

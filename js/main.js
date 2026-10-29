(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header state */
  const header = document.getElementById("site-header");
  const setHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  /* Mobile navigation */
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);

    if (open) {
      const firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  const brand = document.querySelector(".brand");
  if (brand) {
    brand.addEventListener("click", () => setMenu(false));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && nav.classList.contains("is-open")) {
      setMenu(false);
    }
  });

  /* Reveal on scroll */
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* Active section in navigation */
  const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const updateActiveLink = () => {
    if (!sections.length) return;

    const marker = window.scrollY + window.innerHeight * 0.32;
    let current = null;

    sections.forEach((section) => {
      if (section.offsetTop <= marker) current = section;
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
      current = sections[sections.length - 1];
    }

    navLinks.forEach((link) => {
      const isActive = current ? link.getAttribute("href") === `#${current.id}` : false;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        updateActiveLink();
        scrollTicking = false;
      });
    },
    { passive: true }
  );
  updateActiveLink();
  window.addEventListener("resize", updateActiveLink, { passive: true });

  /* Copy email */
  const copyButton = document.querySelector(".copy-btn");
  const copyToast = document.querySelector(".copy-toast");

  if (copyButton && copyToast) {
    let toastTimer;

    const showToast = (message) => {
      copyToast.textContent = message;
      copyToast.classList.add("is-visible");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        copyToast.classList.remove("is-visible");
      }, 2600);
    };

    const fallbackCopy = (text) => {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      let success = false;
      try {
        success = document.execCommand("copy");
      } catch (error) {
        success = false;
      }
      document.body.removeChild(field);
      return success;
    };

    copyButton.addEventListener("click", async () => {
      const email = copyButton.dataset.copy;
      let copied = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(email);
          copied = true;
        } catch (error) {
          copied = fallbackCopy(email);
        }
      } else {
        copied = fallbackCopy(email);
      }

      showToast(copied ? "Email copied to clipboard" : "Could not copy — please select it manually");
    });
  }

  /* Year */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Small pointer parallax for the hero illustration (desktop only) */
  const stage = document.querySelector(".hero-stage");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (stage && canHover && !prefersReducedMotion) {
    const wallet = stage.querySelector(".float-card--wallet");
    const stack = stage.querySelector(".float-card--stack");

    stage.addEventListener("pointermove", (event) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      if (wallet) {
        wallet.style.translate = `${x * 9}px ${y * 7}px`;
      }
      if (stack) {
        stack.style.translate = `${x * -7}px ${y * -5}px`;
      }
    });

    stage.addEventListener("pointerleave", () => {
      if (wallet) wallet.style.translate = "";
      if (stack) stack.style.translate = "";
    });
  }
})();

/* ============================================================
   LYDIERNA — main.js
   Vanilla JS, sin dependencias. Cada init está aislado con
   safe() para que un error puntual no rompa el resto del sitio.
   ============================================================ */
(function () {
  "use strict";

  function safe(fn, name) {
    try {
      fn();
    } catch (err) {
      if (window.console && console.warn) {
        console.warn("[lydierna]", name, "fallo:", err);
      }
    }
  }

  /* Quita la clase no-js en cuanto el script corre */
  safe(function removeNoJs() {
    document.documentElement.classList.remove("no-js");
  }, "no-js");

  /* Header: fondo/blur al hacer scroll */
  safe(function headerScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }, "headerScroll");

  /* Menú móvil */
  safe(function mobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    var close = function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    var open = function () {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.contains("is-open");
      if (isOpen) close();
      else open();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) close();
    });
  }, "mobileNav");

  /* Reveal on scroll — con red de seguridad de 6s */
  safe(function revealOnScroll() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (el) { io.observe(el); });

    /* red de seguridad: si algo quedó oculto, se muestra igual */
    window.setTimeout(function () {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }, 6000);
  }, "revealOnScroll");

  /* Marca el link activo del nav según la página actual */
  safe(function activeNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a[href]").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        link.classList.add("is-active");
      }
    });
  }, "activeNav");

  /* Año dinámico en el footer */
  safe(function footerYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }, "footerYear");

  /* Formulario de contacto → Formspree, con mejora progresiva por fetch */
  safe(function contactForm() {
    var form = document.querySelector("#contact-form");
    if (!form) return;
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    var setStatus = function (kind, msg) {
      if (!status) return;
      status.textContent = msg;
      status.classList.remove("ok", "err");
      status.classList.add(kind === "ok" ? "ok" : "err", "is-visible");
    };

    form.addEventListener("submit", function (e) {
      /* Si el action todavía es el placeholder, dejamos el envío
         normal del navegador (que no va a ningún lado útil) y
         avisamos en consola — Dave: reemplazá el ID de Formspree
         en contacto.html para activar el formulario. */
      var action = form.getAttribute("action") || "";
      if (action.indexOf("TU_ID_DE_FORMSPREE") !== -1) {
        e.preventDefault();
        setStatus(
          "err",
          "El formulario todavía no está conectado. Mientras tanto, escribinos por WhatsApp."
        );
        return;
      }

      e.preventDefault();
      if (submitBtn) submitBtn.disabled = true;
      setStatus("ok", "Enviando...");

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (res.ok) {
            setStatus("ok", "¡Listo! Recibimos tu mensaje, te respondemos a la brevedad.");
            form.reset();
          } else {
            setStatus("err", "No pudimos enviar el mensaje. Probá de nuevo o escribinos por WhatsApp.");
          }
        })
        .catch(function () {
          setStatus("err", "No pudimos enviar el mensaje. Probá de nuevo o escribinos por WhatsApp.");
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }, "contactForm");
})();

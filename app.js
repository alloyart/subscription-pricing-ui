(() => {
  if (!document.querySelector('link[data-stage3-motion]')) {
    const motionStylesheet = document.createElement("link");
    motionStylesheet.rel = "stylesheet";
    motionStylesheet.href = "motion.css";
    motionStylesheet.dataset.stage3Motion = "true";
    document.head.appendChild(motionStylesheet);
  }

  const COPY = Object.freeze({
    accountFree: "Free",
    accountPro: "Pro",
    currentPlan: "Your current plan",
    upgradePro: "Upgrade to Pro",
    upgradingPro: "Upgrading to Pro…",
    successAnnouncement: "Your plan is now active. You can use your Pro benefits immediately."
  });

  const MOTION = Object.freeze({
    modalOpenMs: 260,
    modalCloseMs: 180,
    processingMs: 300
  });

  const appShell = document.querySelector("#app-shell");
  const freeCard = document.querySelector("#free-card");
  const proCard = document.querySelector("#pro-card");
  const ultraCard = document.querySelector("#ultra-card");
  const proTitle = document.querySelector("#pro-title");
  const freeCurrent = document.querySelector("#free-current");
  const proCta = document.querySelector("#pro-cta");
  const proCurrent = document.querySelector("#pro-current");
  const proRecommended = document.querySelector("#pro-recommended");
  const ultraRecommended = document.querySelector("#ultra-recommended");
  const ultraCta = ultraCard?.querySelector(".plan-action");
  const sidebarPlan = document.querySelector("#sidebar-plan");
  const planStatus = document.querySelector("#plan-status");
  const successLayer = document.querySelector("#success-layer");
  const modal = successLayer?.querySelector(".modal");
  const modalTitle = document.querySelector("#modal-title");
  const modalClose = document.querySelector("#modal-close");
  const startUsing = document.querySelector("#start-using");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!appShell || !freeCard || !proCard || !ultraCard || !proTitle || !freeCurrent || !proCta || !proCurrent || !proRecommended || !ultraRecommended || !ultraCta || !sidebarPlan || !planStatus || !successLayer || !modal || !modalTitle || !modalClose || !startUsing) {
    return;
  }

  let processing = false;
  let subscribed = false;
  let modalState = "closed";
  let closeTimer = null;
  let openFrame = null;

  const getFocusableModalControls = () => [modalClose, startUsing].filter((element) => !element.disabled && !element.hidden);
  const motionDuration = (ms) => motionPreference.matches ? 0 : ms;

  function clearMotionHandles() {
    if (closeTimer !== null) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    if (openFrame !== null) {
      window.cancelAnimationFrame(openFrame);
      openFrame = null;
    }
  }

  function applyProState() {
    subscribed = true;
    appShell.dataset.currentPlan = "pro";

    freeCard.classList.remove("is-current");
    freeCard.removeAttribute("aria-current");
    freeCurrent.textContent = "";
    freeCurrent.classList.add("plan-action--placeholder");
    freeCurrent.removeAttribute("aria-label");
    freeCurrent.setAttribute("aria-hidden", "true");

    proCard.classList.add("is-current");
    proCard.classList.remove("is-recommended");
    proCard.setAttribute("aria-current", "true");
    proCard.removeAttribute("aria-busy");
    proRecommended.hidden = true;
    proCta.hidden = true;
    proCta.disabled = false;
    proCta.classList.remove("is-processing");
    proCta.textContent = COPY.upgradePro;
    proCurrent.hidden = false;
    proCurrent.textContent = COPY.currentPlan;

    ultraCard.classList.add("is-recommended");
    ultraRecommended.hidden = false;
    ultraCta.classList.remove("plan-action--secondary");
    ultraCta.classList.add("plan-action--primary");

    sidebarPlan.textContent = COPY.accountPro;
    planStatus.textContent = COPY.successAnnouncement;
  }

  function finalizeModalClose() {
    successLayer.hidden = true;
    successLayer.classList.remove("is-open", "is-closing");
    appShell.inert = false;
    appShell.removeAttribute("aria-hidden");
    document.body.classList.remove("modal-open");
    modalState = "closed";
    closeTimer = null;
    proTitle.focus({ preventScroll: true });
  }

  function openModal({ focus = true } = {}) {
    if (modalState === "open" || modalState === "opening") return;

    clearMotionHandles();
    modalState = "opening";
    successLayer.hidden = false;
    successLayer.classList.remove("is-closing");
    appShell.inert = true;
    appShell.setAttribute("aria-hidden", "true");
    document.body.classList.add("modal-open");

    void successLayer.offsetWidth;
    openFrame = window.requestAnimationFrame(() => {
      successLayer.classList.add("is-open");
      modalState = "open";
      openFrame = null;
      if (focus) modalTitle.focus({ preventScroll: true });
    });
  }

  function closeModal() {
    if (modalState === "closed" || modalState === "closing") return;

    clearMotionHandles();
    modalState = "closing";
    successLayer.classList.add("is-closing");
    successLayer.classList.remove("is-open");

    const duration = motionDuration(MOTION.modalCloseMs);
    if (duration === 0) {
      finalizeModalClose();
      return;
    }

    closeTimer = window.setTimeout(finalizeModalClose, duration + 24);
  }

  function resetProcessingState() {
    processing = false;
    proCard.removeAttribute("aria-busy");
    proCta.disabled = false;
    proCta.classList.remove("is-processing");
    proCta.textContent = COPY.upgradePro;
  }

  function startUpgrade() {
    if (processing || subscribed) return;

    processing = true;
    proCard.setAttribute("aria-busy", "true");
    proCta.disabled = true;
    proCta.classList.add("is-processing");
    proCta.textContent = COPY.upgradingPro;
    planStatus.textContent = COPY.upgradingPro;

    window.setTimeout(() => {
      try {
        processing = false;
        applyProState();
        openModal();
      } catch (error) {
        resetProcessingState();
        console.error("Prototype state transition failed", error);
      }
    }, MOTION.processingMs);
  }

  function trapModalFocus(event) {
    if (event.key !== "Tab" || successLayer.hidden || modalState === "closing") return;
    const focusable = getFocusableModalControls();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (active === modalTitle) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (!modal.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  proCta.addEventListener("click", startUpgrade);
  modalClose.addEventListener("click", closeModal);
  startUsing.addEventListener("click", closeModal);

  successLayer.addEventListener("click", (event) => {
    if (event.target === successLayer) {
      event.preventDefault();
      modal.focus?.({ preventScroll: true });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (successLayer.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    trapModalFocus(event);
  });

  motionPreference.addEventListener?.("change", () => {
    if (motionPreference.matches && modalState === "closing") finalizeModalClose();
  });

  const debugState = new URLSearchParams(window.location.search).get("state");
  if (debugState === "loading") {
    processing = true;
    proCard.setAttribute("aria-busy", "true");
    proCta.disabled = true;
    proCta.classList.add("is-processing");
    proCta.textContent = COPY.upgradingPro;
  } else if (debugState === "success") {
    applyProState();
    openModal();
  } else if (debugState === "completed") {
    applyProState();
  }
})();

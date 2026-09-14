(() => {
  if (!document.querySelector('link[data-stage3-motion]')) {
    const motionStylesheet = document.createElement("link");
    motionStylesheet.rel = "stylesheet";
    motionStylesheet.href = "motion.css?v=20260914-stage4";
    motionStylesheet.dataset.stage3Motion = "true";
    document.head.appendChild(motionStylesheet);
  }

  const COPY = Object.freeze({
    accountFree: "Free",
    accountPro: "Pro",
    currentPlan: "Your current plan",
    upgradePro: "Upgrade to Pro",
    upgradingPro: "Upgrading to Pro…",
    successAnnouncement: "Your plan is now active. You can use your Pro benefits immediately.",
    upgradeError: "Upgrade failed. Try again.",
    monthlySelected: "Monthly billing selected."
  });

  const TIMING = Object.freeze({
    modalCloseMs: 180,
    processingMs: 300
  });

  const params = new URLSearchParams(window.location.search);
  let failNextUpgrade = params.get("mock") === "error-once";

  const appShell = document.querySelector("#app-shell");
  const productMark = document.querySelector(".product-mark");
  const plansNav = document.querySelector('.nav-item[aria-current="page"]');
  const billingMonthly = document.querySelector("#billing-monthly");
  const freeCard = document.querySelector("#free-card");
  const proCard = document.querySelector("#pro-card");
  const ultraCard = document.querySelector("#ultra-card");
  const proTitle = document.querySelector("#pro-title");
  const freeCurrent = document.querySelector("#free-current");
  const proCta = document.querySelector("#pro-cta");
  const proCurrent = document.querySelector("#pro-current");
  const proRecommended = document.querySelector("#pro-recommended");
  const proFeedback = document.querySelector("#pro-feedback");
  const ultraCta = document.querySelector("#ultra-cta");
  const sidebarPlan = document.querySelector("#sidebar-plan");
  const planStatus = document.querySelector("#plan-status");
  const successLayer = document.querySelector("#success-layer");
  const modal = successLayer?.querySelector(".modal");
  const modalTitle = document.querySelector("#modal-title");
  const modalClose = document.querySelector("#modal-close");
  const startUsing = document.querySelector("#start-using");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  const required = [
    appShell,
    productMark,
    plansNav,
    billingMonthly,
    freeCard,
    proCard,
    ultraCard,
    proTitle,
    freeCurrent,
    proCta,
    proCurrent,
    proRecommended,
    proFeedback,
    ultraCta,
    sidebarPlan,
    planStatus,
    successLayer,
    modal,
    modalTitle,
    modalClose,
    startUsing
  ];

  if (required.some((element) => !element)) return;

  let state = "initial";
  let processing = false;
  let subscribed = false;
  let modalState = "closed";
  let closeTimer = null;
  let openFrame = null;
  let upgradeTimer = null;

  const getFocusableModalControls = () => [modalClose, startUsing].filter((element) => !element.disabled && !element.hidden);
  const motionDuration = (ms) => motionPreference.matches ? 0 : ms;

  function clearUpgradeTimer() {
    if (upgradeTimer !== null) {
      window.clearTimeout(upgradeTimer);
      upgradeTimer = null;
    }
  }

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

  function clearFeedback() {
    proFeedback.hidden = true;
    proFeedback.textContent = "";
    proCard.classList.remove("has-error");
  }

  function normalizeUltraDefaultState() {
    ultraCard.classList.remove("is-recommended", "is-current", "plan-card--pro");
    ultraCard.removeAttribute("aria-current");
    ultraCard.querySelector(".recommended")?.remove();
    ultraCta.classList.remove("plan-action--primary", "is-processing");
    ultraCta.classList.add("plan-action--secondary");
    ultraCta.disabled = true;
    ultraCta.setAttribute("aria-disabled", "true");
  }

  function resetInitialState() {
    clearUpgradeTimer();
    clearMotionHandles();

    state = "initial";
    processing = false;
    subscribed = false;
    modalState = "closed";

    successLayer.hidden = true;
    successLayer.classList.remove("is-open", "is-closing");
    appShell.inert = false;
    appShell.removeAttribute("aria-hidden");
    document.body.classList.remove("modal-open");

    appShell.dataset.currentPlan = "free";
    freeCard.classList.add("is-current");
    freeCard.setAttribute("aria-current", "true");
    freeCurrent.textContent = COPY.currentPlan;
    freeCurrent.classList.remove("plan-action--placeholder");
    freeCurrent.setAttribute("aria-label", COPY.currentPlan);
    freeCurrent.removeAttribute("aria-hidden");

    proCard.classList.remove("is-current", "has-error");
    proCard.classList.add("is-recommended");
    proCard.removeAttribute("aria-current");
    proCard.removeAttribute("aria-busy");
    proRecommended.hidden = false;
    proCta.hidden = false;
    proCta.disabled = false;
    proCta.classList.remove("is-processing");
    proCta.textContent = COPY.upgradePro;
    proCurrent.hidden = true;
    proCurrent.textContent = COPY.currentPlan;

    normalizeUltraDefaultState();
    sidebarPlan.textContent = COPY.accountFree;
    planStatus.textContent = "";
    clearFeedback();
  }

  function applyProState() {
    subscribed = true;
    processing = false;
    state = "success";
    appShell.dataset.currentPlan = "pro";

    freeCard.classList.remove("is-current");
    freeCard.removeAttribute("aria-current");
    freeCurrent.textContent = "";
    freeCurrent.classList.add("plan-action--placeholder");
    freeCurrent.removeAttribute("aria-label");
    freeCurrent.setAttribute("aria-hidden", "true");

    proCard.classList.add("is-current");
    proCard.classList.remove("is-recommended", "has-error");
    proCard.setAttribute("aria-current", "true");
    proCard.removeAttribute("aria-busy");
    proRecommended.hidden = true;
    proCta.hidden = true;
    proCta.disabled = false;
    proCta.classList.remove("is-processing");
    proCta.textContent = COPY.upgradePro;
    proCurrent.hidden = false;
    proCurrent.textContent = COPY.currentPlan;

    normalizeUltraDefaultState();
    clearFeedback();
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
    state = subscribed ? "completed" : "initial";
    closeTimer = null;
    proTitle.focus({ preventScroll: true });
  }

  function openModal({ focus = true } = {}) {
    if (modalState === "open" || modalState === "opening") return;

    clearMotionHandles();
    modalState = "opening";
    state = "success";
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

    const duration = motionDuration(TIMING.modalCloseMs);
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

  function showUpgradeError() {
    resetProcessingState();
    state = "error";
    proCard.classList.add("has-error");
    proFeedback.textContent = COPY.upgradeError;
    proFeedback.hidden = false;
    planStatus.textContent = COPY.upgradeError;
    proCta.focus({ preventScroll: true });
  }

  function startUpgrade() {
    if (processing || subscribed) return;

    clearFeedback();
    clearUpgradeTimer();
    state = "processing";
    processing = true;
    proCard.setAttribute("aria-busy", "true");
    proCta.disabled = true;
    proCta.classList.add("is-processing");
    proCta.textContent = COPY.upgradingPro;
    planStatus.textContent = COPY.upgradingPro;

    upgradeTimer = window.setTimeout(() => {
      upgradeTimer = null;

      if (failNextUpgrade) {
        failNextUpgrade = false;
        showUpgradeError();
        return;
      }

      try {
        applyProState();
        openModal();
      } catch (error) {
        showUpgradeError();
        console.error("Prototype state transition failed", error);
      }
    }, TIMING.processingMs);
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

  billingMonthly.addEventListener("click", () => {
    billingMonthly.setAttribute("aria-selected", "true");
    planStatus.textContent = COPY.monthlySelected;
  });

  productMark.addEventListener("click", () => {
    document.querySelector("#page-title")?.focus?.({ preventScroll: true });
  });

  plansNav.addEventListener("click", () => {
    document.querySelector("#pricing-section")?.scrollIntoView({ block: "start" });
  });

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

  window.addEventListener("pagehide", () => {
    clearUpgradeTimer();
    clearMotionHandles();
  });

  resetInitialState();

  const debugState = params.get("state");
  if (debugState === "loading") {
    processing = true;
    state = "processing";
    proCard.setAttribute("aria-busy", "true");
    proCta.disabled = true;
    proCta.classList.add("is-processing");
    proCta.textContent = COPY.upgradingPro;
  } else if (debugState === "success") {
    applyProState();
    openModal();
  } else if (debugState === "completed") {
    applyProState();
    state = "completed";
  }
})();

(() => {
  const COPY = Object.freeze({
    accountFree: "Free",
    accountPro: "Pro",
    currentPlan: "Your current plan",
    upgradePro: "Upgrade to Pro",
    upgradingPro: "Upgrading to Pro…",
    successAnnouncement: "Your plan is now active. You can use your Pro benefits immediately."
  });

  const appShell = document.querySelector("#app-shell");
  const freeCard = document.querySelector("#free-card");
  const proCard = document.querySelector("#pro-card");
  const proTitle = document.querySelector("#pro-title");
  const freeCurrent = document.querySelector("#free-current");
  const proCta = document.querySelector("#pro-cta");
  const proCurrent = document.querySelector("#pro-current");
  const sidebarPlan = document.querySelector("#sidebar-plan");
  const planStatus = document.querySelector("#plan-status");
  const successLayer = document.querySelector("#success-layer");
  const modal = successLayer?.querySelector(".modal");
  const modalTitle = document.querySelector("#modal-title");
  const modalClose = document.querySelector("#modal-close");
  const startUsing = document.querySelector("#start-using");

  if (!appShell || !freeCard || !proCard || !proTitle || !freeCurrent || !proCta || !proCurrent || !sidebarPlan || !planStatus || !successLayer || !modal || !modalTitle || !modalClose || !startUsing) {
    return;
  }

  let processing = false;
  let subscribed = false;

  const getFocusableModalControls = () => [modalClose, startUsing].filter((element) => !element.disabled && !element.hidden);

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
    proCard.setAttribute("aria-current", "true");
    proCard.removeAttribute("aria-busy");
    proCta.hidden = true;
    proCta.disabled = false;
    proCta.classList.remove("is-processing");
    proCta.textContent = COPY.upgradePro;
    proCurrent.hidden = false;
    proCurrent.textContent = COPY.currentPlan;

    sidebarPlan.textContent = COPY.accountPro;
    planStatus.textContent = COPY.successAnnouncement;
  }

  function openModal() {
    successLayer.hidden = false;
    appShell.inert = true;
    appShell.setAttribute("aria-hidden", "true");
    document.body.classList.add("modal-open");
    modalTitle.focus();
  }

  function closeModal() {
    if (successLayer.hidden) return;
    successLayer.hidden = true;
    appShell.inert = false;
    appShell.removeAttribute("aria-hidden");
    document.body.classList.remove("modal-open");
    proTitle.focus();
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
      processing = false;
      applyProState();
      openModal();
    }, 300);
  }

  function trapModalFocus(event) {
    if (event.key !== "Tab" || successLayer.hidden) return;
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
    if (event.target === successLayer) event.preventDefault();
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

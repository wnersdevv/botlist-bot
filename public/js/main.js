function showToast(message, type = "success") {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

document.addEventListener("click", async (event) => {
  const voteBtn = event.target.closest("[data-vote-bot]");
  if (voteBtn) {
    voteBtn.disabled = true;
    const botId = voteBtn.getAttribute("data-vote-bot");
    const { ok, data } = await postJson(`/bot/${botId}/vote`);
    if (ok) {
      showToast("Oyun kaydedildi.", "success");
      const counter = document.querySelector(`[data-vote-count="${botId}"]`);
      if (counter) counter.textContent = data.data.voteCount;
    } else {
      showToast(data.error?.message || "Oy verilemedi.", "error");
    }
    voteBtn.disabled = false;
  }

  const favBtn = event.target.closest("[data-favorite-bot]");
  if (favBtn) {
    const botId = favBtn.getAttribute("data-favorite-bot");
    const { ok, data } = await postJson(`/bot/${botId}/favorite`);
    if (ok) {
      favBtn.textContent = data.data.favorited ? "Favoride" : "Favorile";
      showToast(data.data.favorited ? "Favorilere eklendi." : "Favorilerden cikarildi.", "success");
    }
  }

  const reportTrigger = event.target.closest("[data-open-report]");
  if (reportTrigger) {
    document.getElementById("report-modal")?.classList.add("open");
  }

  if (event.target.matches("[data-close-modal]")) {
    event.target.closest(".modal")?.classList.remove("open");
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-async-form]");
  if (!form) return;
  event.preventDefault();

  const formData = new FormData(form);
  const body = Object.fromEntries(formData.entries());
  const { ok, data } = await postJson(form.action, body);

  if (ok) {
    showToast(form.dataset.successMessage || "Islem tamamlandi.", "success");
    if (form.dataset.reload === "true") setTimeout(() => window.location.reload(), 600);
    form.reset();
  } else {
    showToast(data.error?.message || "Bir hata olustu.", "error");
  }
});

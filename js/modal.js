/**
 * modal.js — Modal controller for artifact details and 3D preview
 */

function setupModalListeners() {
  document.addEventListener("keydown", e => {
    const modal = document.getElementById("artifactModal");
    if (!modal || !modal.classList.contains("open")) return;
    if (e.key === "Escape") closeArtifactModal();
    if (e.key === "ArrowLeft" && modal.dataset.prevId) openArtifact(modal.dataset.prevId);
    if (e.key === "ArrowRight" && modal.dataset.nextId) openArtifact(modal.dataset.nextId);
  });

  document.addEventListener("click", e => {
    const card = e.target.closest(".artifact-card");
    if (card && !e.target.closest(".fav-btn")) {
      openArtifact(card.dataset.id);
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest && e.target.closest(".artifact-card");
    if (card && !e.target.closest(".fav-btn")) {
      e.preventDefault();
      openArtifact(card.dataset.id);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupModalListeners);
} else {
  setupModalListeners();
}

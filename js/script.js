const stack = document.getElementById("stack");
const dotsContainer = document.getElementById("dots-container");
const loadingSpinner = document.getElementById("loading-spinner");
const searchInput = document.getElementById("search-input");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const filterToggle = document.getElementById("filterToggle");
const filterContainer = document.getElementById("filterContainer");

let allCardData = [];
let filteredCardData = [];
let cards = [];
let currentIndex = 0;
let isDragging = false;
let startX = 0;
let currentDrag = 0;

const SWIPE_THRESHOLD = 70;
const EASING = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

filterToggle.addEventListener("click", () => {
  filterContainer.classList.toggle("collapsed");
  filterToggle.textContent = filterContainer.classList.contains("collapsed")
    ? "FILTERS ▶"
    : "FILTERS ▼";
});

async function loadCards() {
  loadingSpinner.classList.remove("hidden");

  try {
    const response = await fetch("/api/cards.json");
    const data = await response.json();
    allCardData = Array.isArray(data) && data.length > 0 ? data : [];
  } catch (error) {
    console.warn("Error loading cards:", error);
    allCardData = [];
  }

  initFilters();
  loadingSpinner.classList.add("hidden");
}

function generateDynamicFilters() {
  const statuses = [...new Set(allCardData.map((c) => c.status))].sort();
  const categories = [...new Set(allCardData.map((c) => c.category))].sort();

  const createFilterGroup = (items, type, container) => {
    container.innerHTML = "";
    items.forEach((item) => {
      const label = document.createElement("label");
      label.className = "filter-checkbox";
      label.innerHTML = `
        <input type="checkbox" class="${type}-filter" value="${item}" checked />
        <span>${item.toUpperCase().replace(/-/g, " ")}</span>
      `;
      container.appendChild(label);
    });
  };

  createFilterGroup(
    statuses,
    "status",
    document.getElementById("status-filters"),
  );
  createFilterGroup(
    categories,
    "category",
    document.getElementById("category-filters"),
  );
}

function initFilters() {
  generateDynamicFilters();

  document
    .querySelectorAll(".status-filter, .category-filter")
    .forEach((filter) => {
      filter.addEventListener("change", applyFilters);
    });

  searchInput.addEventListener("input", applyFilters);
  applyFilters();
}

function applyFilters() {
  const selectedStatuses = Array.from(
    document.querySelectorAll(".status-filter:checked"),
  ).map((el) => el.value);
  const selectedCategories = Array.from(
    document.querySelectorAll(".category-filter:checked"),
  ).map((el) => el.value);
  const searchTerm = searchInput.value.toLowerCase();

  filteredCardData = allCardData.filter(
    (card) =>
      selectedStatuses.includes(card.status) &&
      selectedCategories.includes(card.category) &&
      card.title.toLowerCase().includes(searchTerm),
  );

  currentIndex = 0;
  renderCards();
}

function renderCards() {
  stack.innerHTML = "";
  cards = [];

  if (filteredCardData.length === 0) {
    stack.innerHTML =
      '<div class="no-projects-message">NO PROJECTS MATCH</div>';
    dotsContainer.innerHTML = "";
    return;
  }

  filteredCardData.forEach((cardObj, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <div class="card-banner">
        <img src="${cardObj.image}" alt="${cardObj.title}" class="card-image" />
      </div>
      <div class="card-content">
        <div class="card-status">${cardObj.status.toUpperCase()}</div>
        <div class="card-title">${cardObj.title}</div>
        <div class="card-category">${cardObj.category}</div>
        <a href="${cardObj.url}" target="_blank" class="card-link">VIEW PROJECT <span class="arrow-icon">➡</span></a>
      </div>
    `;
    stack.appendChild(card);
    cards.push(card);
  });

  renderDots();
  updateStack();
}

function renderDots() {
  dotsContainer.innerHTML = "";
  filteredCardData.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = `dot ${i === currentIndex ? "active" : ""}`;
    dot.addEventListener("click", () => goToCard(i));
    dotsContainer.appendChild(dot);
  });
}

function resetFilters() {
  document
    .querySelectorAll(".status-filter, .category-filter")
    .forEach((el) => (el.checked = true));
  searchInput.value = "";
  applyFilters();
}

function moveLeft() {
  if (filteredCardData.length === 0) return;
  cards[currentIndex].style.transition = `all 0.5s ${EASING}`;
  currentIndex = (currentIndex + 1) % filteredCardData.length;
  updateStack();
}

function goToCard(index) {
  if (filteredCardData.length === 0 || index === currentIndex) return;
  cards[currentIndex].style.transition = `all 0.5s ${EASING}`;
  currentIndex = index;
  updateStack();
}

function updateStack() {
  const total = filteredCardData.length;
  if (total === 0) return;

  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });

  cards.forEach((card, i) => {
    const diff = (i - currentIndex + total) % total;

    if (diff === 0) {
      card.style.transform =
        "translateX(0) translateY(0) translateZ(0) scale(1) rotateZ(0)";
      card.style.opacity = "1";
      card.style.filter = "brightness(1)";
      card.style.zIndex = total;
      card.style.pointerEvents = "auto";
    } else if (diff > 0 && diff < 4) {
      const scale = 1 - diff * 0.04;
      const brightness = 1 - diff * 0.25;
      card.style.transform = `translateX(${diff * 12}px) translateY(${diff * -8}px) translateZ(${diff * -80}px) scale(${scale})`;
      card.style.opacity = "1";
      card.style.filter = `brightness(${brightness})`;
      card.style.zIndex = total - diff;
      card.style.pointerEvents = "none";
    } else {
      card.style.opacity = "0";
      card.style.transform =
        "translateX(0) translateY(0) translateZ(-500px) scale(0.9)";
      card.style.zIndex = 0;
      card.style.pointerEvents = "none";
    }
  });
}

stack.addEventListener("pointerdown", (e) => {
  if (cards.length === 0) return;
  startX = e.pageX;
  isDragging = true;
  currentDrag = 0;
  cards[currentIndex].style.transition = "none";
});

window.addEventListener("pointermove", (e) => {
  if (!isDragging || cards.length === 0) return;
  currentDrag = startX - e.pageX;

  const frontCard = cards[currentIndex];
  const dragPercent = currentDrag / 200;

  frontCard.style.transform = `translateX(${-currentDrag}px) rotateZ(${dragPercent * 15}deg)`;
  frontCard.style.opacity = Math.max(0.3, 1 - Math.abs(dragPercent) * 0.3);
});

window.addEventListener("pointerup", () => {
  if (!isDragging || cards.length === 0) return;
  isDragging = false;

  if (Math.abs(currentDrag) > SWIPE_THRESHOLD) {
    moveLeft();
  } else {
    cards[currentIndex].style.transition = `all 0.3s ${EASING}`;
    updateStack();
  }

  currentDrag = 0;
});

loadCards();

// Initialize filter state
let currentCatFilter = "all";
let currentYearFilter = "all";
let currentSearchFilter = "";


function filterPosts(filterCategory, value) {
  if (filterCategory === "category") {
    currentCatFilter = value;
    // Update active state for category buttons
    document.querySelectorAll("[data-filter-category]").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-filter-category") === value) {
        btn.classList.add("active");
      }
    });
  } else if (filterCategory === "year") {
    currentYearFilter = value;
    // Update active state for year buttons
    document.querySelectorAll("[data-filter-year]").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-filter-year") === value) {
        btn.classList.add("active");
      }
    });
  } else if (filterCategory === "search") {
    currentSearchFilter = value.toLowerCase();
  }

  // Get all year sections (seperators) and post items
  const postList = document.querySelector(".listing");
  if (!postList) return;

  const items = postList.querySelectorAll(".listing-item, .listing-seperator");
  let lastYearHeader = null;
  let visibleInYear = 0;
  let totalVisibleCount = 0;

  // Process items
  items.forEach((item) => {
    if (item.classList.contains("listing-seperator")) {
      // If we move to a new year header, check if the previous one should be shown
      if (lastYearHeader && visibleInYear === 0) {
        lastYearHeader.style.display = "none";
      }
      lastYearHeader = item;
      visibleInYear = 0;
      item.style.display = ""; // Temporarily show, might hide later
    } else {
      const postYear = item.querySelector("time")?.getAttribute("datetime")?.substring(0, 4);
      const postCategories = item.getAttribute("data-categories")?.split(",") || [];
      const postTitle = item.querySelector("a")?.textContent.toLowerCase() || "";

      const showByCat = currentCatFilter === "all" || postCategories.includes(currentCatFilter);
      const showByYear = currentYearFilter === "all" || postYear === currentYearFilter;
      const showBySearch = currentSearchFilter === "" || postTitle.includes(currentSearchFilter);

      if (showByCat && showByYear && showBySearch) {
        item.style.display = "";
        visibleInYear++;
        totalVisibleCount++;
      } else {
        item.style.display = "none";
      }
    }
  });

  // Final check for the last year header
  if (lastYearHeader && visibleInYear === 0) {
    lastYearHeader.style.display = "none";
  }

  // Update search results count
  const countEl = document.getElementById("post-search-results-count");
  if (countEl) {
    if (currentSearchFilter !== "") {
      countEl.textContent = `Found ${totalVisibleCount} post${totalVisibleCount !== 1 ? "s" : ""}`;
      countEl.style.display = "inline-block";
    } else {
      countEl.style.display = "none";
    }
  }
}

// Function to toggle "More Resources"
function toggleLinks() {
  const container = document.getElementById('links-collapsible');
  if (container) {
    container.classList.toggle('is-collapsed');
  }
}

document.addEventListener("DOMContentLoaded", function () {

  // Initial filtering to set up active states
  filterPosts("category", "all");
});

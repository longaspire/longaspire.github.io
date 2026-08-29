(function () {
  "use strict";

  let currentTypeFilter = "all";
  let currentYearFilter = "all";
  let currentSearchFilter = "";

  function getPublicationTypes(item) {
    const types = item.getAttribute("data-publication-types");
    if (types) {
      return types.split(",").map(function (type) { return type.trim(); }).filter(Boolean);
    }

    // Compatibility fallback for entries not yet migrated to structured data.
    return Array.from(item.querySelectorAll(".color-button-type"))
      .map(function (badge) { return badge.textContent.trim().toLowerCase(); });
  }

  function setActiveButton(buttons, value, attribute) {
    buttons.forEach(function (button) {
      const active = button.getAttribute(attribute) === value;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function filterPublications(filterCategory, value) {
    if (filterCategory === "type") {
      currentTypeFilter = value;
    } else if (filterCategory === "year") {
      currentYearFilter = value;
    } else if (filterCategory === "search") {
      currentSearchFilter = value.trim().toLowerCase();
    }

    const typeButtons = Array.from(document.querySelectorAll("[data-filter-type]"));
    const yearButtons = Array.from(document.querySelectorAll("[data-filter-year]"));
    setActiveButton(typeButtons, currentTypeFilter, "data-filter-type");
    setActiveButton(yearButtons, currentYearFilter, "data-filter-year");

    const counts = { type: { all: 0 }, year: { all: 0 } };
    typeButtons.forEach(function (button) {
      counts.type[button.getAttribute("data-filter-type")] = 0;
    });
    yearButtons.forEach(function (button) {
      counts.year[button.getAttribute("data-filter-year")] = 0;
    });

    let totalVisible = 0;
    document.querySelectorAll(".year-section").forEach(function (yearSection) {
      const year = yearSection.getAttribute("data-year");
      const pubList = yearSection.nextElementSibling;
      if (!pubList || pubList.tagName !== "UL") return;

      let visibleInYear = 0;
      pubList.querySelectorAll("li").forEach(function (publication) {
        const types = getPublicationTypes(publication);
        const matchesSearch = currentSearchFilter === "" ||
          publication.textContent.toLowerCase().includes(currentSearchFilter);
        const matchesType = currentTypeFilter === "all" || types.includes(currentTypeFilter);
        const matchesYear = currentYearFilter === "all" || year === currentYearFilter;

        if (matchesSearch && matchesYear) {
          counts.type.all += 1;
          types.forEach(function (type) {
            if (Object.prototype.hasOwnProperty.call(counts.type, type)) counts.type[type] += 1;
          });
        }
        if (matchesSearch && matchesType) {
          counts.year.all += 1;
          if (Object.prototype.hasOwnProperty.call(counts.year, year)) counts.year[year] += 1;
        }

        const visible = matchesSearch && matchesType && matchesYear;
        publication.style.display = visible ? "" : "none";
        if (visible) {
          visibleInYear += 1;
          totalVisible += 1;
        }
      });

      const hasVisiblePublications = visibleInYear > 0;
      yearSection.style.display = hasVisiblePublications ? "" : "none";
      pubList.style.display = hasVisiblePublications ? "" : "none";

      const originalText = yearSection.getAttribute("data-original-text") || yearSection.textContent.trim();
      yearSection.setAttribute("data-original-text", originalText);
      let headingText = originalText;
      if (currentTypeFilter !== "all") {
        const activeType = typeButtons.find(function (button) {
          return button.getAttribute("data-filter-type") === currentTypeFilter;
        });
        if (activeType) headingText += " (" + activeType.textContent.replace(/\s*\(.*$/, "").trim() + ")";
      }
      yearSection.textContent = headingText;
    });

    typeButtons.forEach(function (button) {
      const key = button.getAttribute("data-filter-type");
      const count = document.getElementById("count-type-" + key);
      if (count) count.textContent = "(" + (counts.type[key] || 0) + ")";
    });
    yearButtons.forEach(function (button) {
      const key = button.getAttribute("data-filter-year");
      const count = document.getElementById("count-year-" + key);
      if (count) count.textContent = "(" + (counts.year[key] || 0) + ")";
    });

    const resultCount = document.getElementById("search-results-count");
    if (resultCount) {
      resultCount.hidden = currentSearchFilter === "";
      if (currentSearchFilter !== "") {
        resultCount.textContent = "Found " + totalVisible + " publication" + (totalVisible === 1 ? "" : "s");
      }
    }
  }

  function setupAcknowledgements() {
    const container = document.getElementById("acknowledgements-collapsible");
    const toggle = container && container.querySelector(".acknowledgements-toggle");
    const content = document.getElementById("acknowledgements-content");
    if (!container || !toggle || !content) return;

    toggle.addEventListener("click", function () {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
      content.hidden = expanded;
      container.classList.toggle("acknowledgements-collapsed", expanded);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const typeButtons = document.querySelectorAll("[data-filter-type]");
    const yearButtons = document.querySelectorAll("[data-filter-year]");
    const search = document.getElementById("publication-search");

    typeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterPublications("type", button.getAttribute("data-filter-type"));
      });
    });
    yearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterPublications("year", button.getAttribute("data-filter-year"));
      });
    });
    if (search) {
      search.addEventListener("input", function () {
        filterPublications("search", search.value);
      });
    }

    setupAcknowledgements();
    filterPublications("type", "all");
  });

  // Keep a small public API for bookmarks or older cached markup.
  window.filterPublications = filterPublications;
})();

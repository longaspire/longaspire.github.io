// Initialize filter state
let currentTypeFilter = "all";
let currentYearFilter = "all";
let currentSearchFilter = "";

// Function to determine publication type from its content
function getPublicationType(item) {
  const text = item.innerHTML.toLowerCase();
  if (
    text.includes('color-button-type">journal') &&
    text.includes('color-button-type">conference')
  ) {
    return "both";
  } else if (text.includes('color-button-type">journal')) {
    return "journal";
  } else if (
    text.includes('color-button-type">conference') ||
    text.includes('color-button-type">confernece')
  ) {
    return "conference";
  }
  // Default to conference if no type found
  return "conference";
}

// Function to count publications by type and year
function countPublications() {
  const yearSections = document.querySelectorAll(".year-section");
  const counts = {
    type: { all: 0, journal: 0, conference: 0 },
    year: {
      all: 0,
      2025: 0,
      2024: 0,
      2023: 0,
      2022: 0,
      2021: 0,
      2020: 0,
      2019: 0,
      2018: 0,
    },
  };

  yearSections.forEach((yearSection) => {
    const year = yearSection.getAttribute("data-year");
    const pubList = yearSection.nextElementSibling;

    if (!pubList || pubList.tagName !== "UL") {
      return;
    }

    const publications = pubList.querySelectorAll("li");
    publications.forEach((pub) => {
      const pubType = getPublicationType(pub);

      // Count by type
      counts.type.all++;
      if (pubType === "journal" || pubType === "both") {
        counts.type.journal++;
      }
      if (pubType === "conference" || pubType === "both") {
        counts.type.conference++;
      }

      // Count by year
      counts.year.all++;
      if (year && counts.year[year] !== undefined) {
        counts.year[year]++;
      }
    });
  });

  // Update type counts
  document.getElementById("count-type-all").textContent =
    "(" + counts.type.all + ")";
  document.getElementById("count-type-journal").textContent =
    "(" + counts.type.journal + ")";
  document.getElementById("count-type-conference").textContent =
    "(" + counts.type.conference + ")";

  // Update year counts
  document.getElementById("count-year-all").textContent =
    "(" + counts.year.all + ")";
  ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"].forEach(
    (year) => {
      const countEl = document.getElementById("count-year-" + year);
      if (countEl) {
        countEl.textContent = "(" + counts.year[year] + ")";
      }
    }
  );
}

// Function to toggle acknowledgements
function toggleAcknowledgements() {
  const collapsible = document.getElementById("acknowledgements-collapsible");
  collapsible.classList.toggle("acknowledgements-collapsed");
}

// Helper to convert string to Title Case and handle acronyms
function toTitleCase(str) {
  if (!str) return str;
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v\.?|vs\.?|via)$/i;
  const acronyms = /^(ai|iot|llm|ml|nlp|it)$/i;

  return str.split(/\s+/).map((word, index, words) => {
    const lower = word.toLowerCase();

    // Handle acronyms
    if (lower.match(acronyms)) {
      return word.toUpperCase();
    }

    // Check if it's the first word or start of subtitle (after colon)
    const isSubtitleStart = index > 0 && words[index - 1].endsWith(':');

    // Preserve mixed case for first word or subtitle start to support acronyms like CoIDO
    // Also ensures subtitle start words like "On" are capitalized
    if (index === 0 || isSubtitleStart) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Always capitalize last word, or words that aren't "small words"
    if (index === words.length - 1 || !lower.match(smallWords)) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    return lower;
  }).join(' ');
}

// Function to filter publications
function filterPublications(filterCategory, value) {
  if (filterCategory === "type") {
    currentTypeFilter = value;
    // Update active state for type buttons
    document.querySelectorAll("[data-filter-type]").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-filter-type") === value) {
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

  // Get all year sections and their publication lists
  const yearSections = document.querySelectorAll(".year-section");
  let totalVisibleCount = 0;

  yearSections.forEach((yearSection) => {
    const year = yearSection.getAttribute("data-year");
    const pubList = yearSection.nextElementSibling;

    if (!pubList || pubList.tagName !== "UL") {
      return;
    }

    let hasVisiblePublications = false;
    const publications = pubList.querySelectorAll("li");

    publications.forEach((pub) => {
      const pubType = getPublicationType(pub);
      const showByType =
        currentTypeFilter === "all" ||
        (currentTypeFilter === "journal" &&
          (pubType === "journal" || pubType === "both")) ||
        (currentTypeFilter === "conference" &&
          (pubType === "conference" || pubType === "both"));

      const showByYear =
        currentYearFilter === "all" ||
        (currentYearFilter === "2025" && year === "2025") ||
        (currentYearFilter === "2024" && year === "2024") ||
        (currentYearFilter === "2023" && year === "2023") ||
        (currentYearFilter === "2022" && year === "2022") ||
        (currentYearFilter === "2021" && year === "2021") ||
        (currentYearFilter === "2020" && year === "2020") ||
        (currentYearFilter === "2019" && year === "2019") ||
        (currentYearFilter === "2018" && year === "2018");

      const showBySearch =
        currentSearchFilter === "" ||
        pub.textContent.toLowerCase().includes(currentSearchFilter);

      if (showByType && showByYear && showBySearch) {
        pub.style.display = "";
        // Show the <br> tag that immediately follows this list item (if it exists)
        let nextNode = pub.nextSibling;
        while (nextNode && nextNode.nodeType === Node.TEXT_NODE && !nextNode.textContent.trim()) {
          nextNode = nextNode.nextSibling;
        }
        if (nextNode && nextNode.tagName === "BR") {
          nextNode.style.display = "";
        }
        hasVisiblePublications = true;
        totalVisibleCount++;
      } else {
        pub.style.display = "none";
        // Hide the <br> tag that immediately follows this list item
        let nextNode = pub.nextSibling;
        while (nextNode && nextNode.nodeType === Node.TEXT_NODE && !nextNode.textContent.trim()) {
          nextNode = nextNode.nextSibling;
        }
        if (nextNode && nextNode.tagName === "BR") {
          nextNode.style.display = "none";
        }
      }
    });

    // Show/hide year section based on visible publications
    if (hasVisiblePublications) {
      yearSection.style.display = "";
      pubList.style.display = "";

      // Add type identifier to year section title
      let originalText = yearSection.getAttribute("data-original-text");
      if (!originalText) {
        // Extract original text (remove any existing type identifier)
        originalText = yearSection.textContent
          .trim()
          .replace(/\s*\(Journal\)\s*$/, "")
          .replace(/\s*\(Conference\)\s*$/, "");
        yearSection.setAttribute("data-original-text", originalText);
      }

      // Add type identifier based on current filter
      let displayText = originalText;
      if (currentTypeFilter === "journal") {
        displayText =
          originalText +
          ' <span style="font-size: 0.75em; color: #666; font-weight: normal;">(Journal)</span>';
      } else if (currentTypeFilter === "conference") {
        displayText =
          originalText +
          ' <span style="font-size: 0.75em; color: #666; font-weight: normal;">(Conference)</span>';
      }
      // Only update if text has changed
      if (yearSection.innerHTML !== displayText) {
        yearSection.innerHTML = displayText;
      }
    } else {
      yearSection.style.display = "none";
      pubList.style.display = "none";
    }
  });

  // Update search results count
  const countEl = document.getElementById("search-results-count");
  if (countEl) {
    if (currentSearchFilter !== "") {
      countEl.textContent = `Found ${totalVisibleCount} publication${totalVisibleCount !== 1 ? "s" : ""}`;
      countEl.style.display = "inline-block";
    } else {
      countEl.style.display = "none";
    }
  }
}

// Function to enhance publication items with class names and Title Case
function enhancePublicationItems() {
  const publications = document.querySelectorAll(
    "#publications-container ul li"
  );

  publications.forEach((li) => {
    // Skip if already processed
    if (li.querySelector(".pub-title")) {
      return;
    }

    const html = li.innerHTML;
    // Pattern: title<br>authors<br><i>venue</i>...
    // Use regex to find title and authors parts
    const match = html.match(/^(.*?)<br\s*\/?>(.*?)<br\s*\/?>(.*)$/i);

    if (match) {
      const title = toTitleCase(match[1].trim());
      const authors = match[2].trim();
      const rest = match[3]; // venue and buttons

      // Reconstruct HTML with spans - removing <br> to rely on CSS block display and margins
      li.innerHTML =
        '<span class="pub-title">' +
        title +
        '</span><span class="pub-authors">' +
        authors +
        "</span>" +
        rest;
    } else {
      // Fallback: try to find at least title
      const firstBr = html.indexOf("<br");
      if (firstBr > 0) {
        const title = toTitleCase(html.substring(0, firstBr).trim());
        const rest = html.substring(firstBr);
        li.innerHTML = '<span class="pub-title">' + title + "</span>" + rest;
      }
    }
  });
}

// Initialize on page load - apply both filters and count
document.addEventListener("DOMContentLoaded", function () {
  // Enhance publication items with class names
  enhancePublicationItems();
  // Count publications first
  countPublications();
  // Trigger filtering with current filter values (shows all by default)
  filterPublications("type", currentTypeFilter);
  // Collapse acknowledgements by default
  const collapsible = document.getElementById("acknowledgements-collapsible");
  if (collapsible) {
    collapsible.classList.add("acknowledgements-collapsed");
  }
});

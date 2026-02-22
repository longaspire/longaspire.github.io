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

// Function to toggle acknowledgements
function toggleAcknowledgements() {
  const collapsible = document.getElementById("acknowledgements-collapsible");
  collapsible.classList.toggle("acknowledgements-collapsed");
}

// Helper to convert string to Title Case while preserving acronyms/special formats
function toTitleCase(str) {
  if (!str) return str;

  const smallWords = /^(a|an|and|as|at|but|by|en|for|into|if|in|nor|of|on|or|per|the|to|v\.?|vs\.?|via)$/i;

  // Process a single "word" (could be part of a hyphenated word)
  function processWord(word, isFirstInSegment) {
    // Strip surrounding non-word characters for analysis
    const clean = word.replace(/^[^\w^]+|[^\w]+$/g, '');
    if (!clean) return word; 

    // Preservation Heuristic: Keep if all caps, mixed case, or has special symbols
    const isSpecial = clean.length > 1 && (
      (clean === clean.toUpperCase()) || 
      (/[A-Z]/.test(clean.slice(1))) || 
      (/[\d\^_\+\*]/.test(clean))
    );

    if (isSpecial) return word;

    const lower = clean.toLowerCase();
    
    // If it's a small word and NOT the start of a segment, force lowercase
    if (smallWords.test(lower) && !isFirstInSegment) {
      return word.replace(clean, lower);
    }

    // Standard capitalization for ordinary words
    return word.replace(clean, lower.charAt(0).toUpperCase() + lower.slice(1));
  }

  // Split by whitespace and process each token
  const tokens = str.split(/\s+/);
  return tokens.map((token, index) => {
    const isFirst = index === 0;
    const isLast = index === tokens.length - 1;
    const followsSeparator = index > 0 && (
      tokens[index-1].endsWith(':') || 
      tokens[index-1].endsWith(';') || 
      tokens[index-1] === '&'
    );

    // Handle internal hyphens like "two-tier" or "multi-DNN"
    if (token.includes('-') && token.length > 1) {
      const parts = token.split('-');
      return parts.map((part, pIdx) => {
        const isStart = (pIdx === 0 && (isFirst || followsSeparator));
        return processWord(part, isStart || pIdx > 0);
      }).join('-');
    }

    return processWord(token, isFirst || isLast || followsSeparator);
  }).join(' ');
}

// Function to filter publications and update dynamic counters
function filterPublications(filterCategory, value) {
  if (filterCategory === "type") {
    currentTypeFilter = value;
    document.querySelectorAll("[data-filter-type]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-filter-type") === value);
    });
  } else if (filterCategory === "year") {
    currentYearFilter = value;
    document.querySelectorAll("[data-filter-year]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-filter-year") === value);
    });
  } else if (filterCategory === "search") {
    currentSearchFilter = value.toLowerCase();
  }

  const yearSections = document.querySelectorAll(".year-section");
  let totalVisibleOverall = 0;
  
  // Counts structure to track matches for buttons
  const counts = {
    type: { all: 0, journal: 0, conference: 0 },
    year: { all: 0, 2026: 0, 2025: 0, 2024: 0, 2023: 0, 2022: 0, 2021: 0, 2020: 0, 2019: 0, 2018: 0 }
  };

  yearSections.forEach((yearSection) => {
    const year = yearSection.getAttribute("data-year");
    const pubList = yearSection.nextElementSibling;
    if (!pubList || pubList.tagName !== "UL") return;

    let visibleInYear = 0;
    const publications = pubList.querySelectorAll("li");

    publications.forEach((pub) => {
      const pubType = getPublicationType(pub);
      
      const matchesSearch = currentSearchFilter === "" || pub.textContent.toLowerCase().includes(currentSearchFilter);
      const matchesType = currentTypeFilter === "all" || (currentTypeFilter === "journal" && (pubType === "journal" || pubType === "both")) || (currentTypeFilter === "conference" && (pubType === "conference" || pubType === "both"));
      const matchesYear = currentYearFilter === "all" || year === currentYearFilter;

      // Update counters for TYPE buttons: must match Search + Year filter
      if (matchesSearch && matchesYear) {
        counts.type.all++;
        if (pubType === "journal" || pubType === "both") counts.type.journal++;
        if (pubType === "conference" || pubType === "both") counts.type.conference++;
      }

      // Update counters for YEAR buttons: must match Search + Type filter
      if (matchesSearch && matchesType) {
        counts.year.all++;
        if (counts.year[year] !== undefined) counts.year[year]++;
      }

      // Final visibility check (matches ALL filters)
      if (matchesSearch && matchesType && matchesYear) {
        pub.style.display = "";
        visibleInYear++;
        totalVisibleOverall++;
        
        // Handle trailing <br>
        let nextNode = pub.nextSibling;
        while (nextNode && nextNode.nodeType === Node.TEXT_NODE && !nextNode.textContent.trim()) nextNode = nextNode.nextSibling;
        if (nextNode && nextNode.tagName === "BR") nextNode.style.display = "";
      } else {
        pub.style.display = "none";
        let nextNode = pub.nextSibling;
        while (nextNode && nextNode.nodeType === Node.TEXT_NODE && !nextNode.textContent.trim()) nextNode = nextNode.nextSibling;
        if (nextNode && nextNode.tagName === "BR") nextNode.style.display = "none";
      }
    });

    // Handle Year Section visibility and Title
    if (visibleInYear > 0) {
      yearSection.style.display = "";
      pubList.style.display = "";
      
      let originalText = yearSection.getAttribute("data-original-text") || yearSection.textContent.trim().replace(/\s*\(Journal\)\s*$/, "").replace(/\s*\(Conference\)\s*$/, "");
      if (!yearSection.getAttribute("data-original-text")) yearSection.setAttribute("data-original-text", originalText);

      let displayText = originalText;
      if (currentTypeFilter === "journal") displayText += ' <span style="font-size: 0.75em; color: #666; font-weight: normal;">(Journal)</span>';
      else if (currentTypeFilter === "conference") displayText += ' <span style="font-size: 0.75em; color: #666; font-weight: normal;">(Conference)</span>';
      
      if (yearSection.innerHTML !== displayText) yearSection.innerHTML = displayText;
    } else {
      yearSection.style.display = "none";
      pubList.style.display = "none";
    }
  });

  // Update DOM with new counts
  document.getElementById("count-type-all").textContent = "(" + counts.type.all + ")";
  document.getElementById("count-type-journal").textContent = "(" + counts.type.journal + ")";
  document.getElementById("count-type-conference").textContent = "(" + counts.type.conference + ")";

  document.getElementById("count-year-all").textContent = "(" + counts.year.all + ")";
  Object.keys(counts.year).forEach(y => {
    if (y === "all") return;
    const el = document.getElementById("count-year-" + y);
    if (el) el.textContent = "(" + counts.year[y] + ")";
  });

  // Update search results message
  const countEl = document.getElementById("search-results-count");
  if (countEl) {
    if (currentSearchFilter !== "") {
      countEl.textContent = `Found ${totalVisibleOverall} publication${totalVisibleOverall !== 1 ? "s" : ""}`;
      countEl.style.display = "inline-block";
    } else {
      countEl.style.display = "none";
    }
  }
}

// Integrated into filterPublications

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
  filterPublications("type", currentTypeFilter);
  // Collapse acknowledgements by default
  const collapsible = document.getElementById("acknowledgements-collapsible");
  if (collapsible) {
    collapsible.classList.add("acknowledgements-collapsed");
  }
});

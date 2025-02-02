// app.js

const API_URL = "http://localhost:8000/api/validation-status";

// Mapping error types to responsible teams
const teamMapping = {
  "LetterCode": "Document Processing Team",
  "Address mismatch": "Address Verification Team",
  "Invalid date format": "Date Handling Team",
  "Invalid email format": "Email Verification Team"
};

document.addEventListener('DOMContentLoaded', () => {
  fetchErrorData();


  const scrollBtn = document.querySelector('.scroll-btn');
  scrollBtn.addEventListener('click', () => {
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
  });


  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    filterByErrorType(e.target.value);
  });
});

let originalData = [];


async function fetchErrorData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.validation_status) {
      throw new Error("Invalid data format: missing 'validation_status' field");
    }
    originalData = data.validation_status; // Save original data
    renderStats(originalData);
    renderAccordions(originalData);
  } catch (err) {
    console.error("Error fetching data:", err);
    document.getElementById('errorTypeAccordion').innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to load error data. Please try again later.
      </div>
    `;
  }
}

/**
 * Render top-level stats in the statsRow
 */
function renderStats(errorArray) {
  const statsRow = document.getElementById('statsRow');
  statsRow.innerHTML = '';

  // 1. Total errors
  const totalErrors = errorArray.length;

  // 2. Distinct error types
  const uniqueTypes = new Set(errorArray.map(e => e.error_type));
  const distinctErrorTypes = uniqueTypes.size;

  // 3. Most common error type
  const typeCounts = {};
  errorArray.forEach(err => {
    typeCounts[err.error_type] = (typeCounts[err.error_type] || 0) + 1;
  });
  let maxType = null, maxCount = 0;
  for (const [etype, count] of Object.entries(typeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxType = etype;
    }
  }

  // Create 3 Stats Cards in a row
  const statsData = [
    { title: "Total Errors", value: totalErrors },
    { title: "Distinct Error Types", value: distinctErrorTypes },
    { title: "Most Common Type", value: maxType || "N/A" },
  ];

  statsData.forEach(item => {
    const col = document.createElement('div');
    col.className = "col-md-4 mb-3";
    col.innerHTML = `
      <div class="stats-card">
        <div class="stats-title">${item.title}</div>
        <div class="stats-value">${item.value}</div>
      </div>
    `;
    statsRow.appendChild(col);
  });
}

/**
 * Build and render the two-level accordions
 */
function renderAccordions(errorArray) {
  const outerAccordion = document.getElementById('errorTypeAccordion');
  outerAccordion.innerHTML = '';

  // Group by error_type
  const categorized = {};
  errorArray.forEach(item => {
    const etype = item.error_type;
    if (!categorized[etype]) {
      categorized[etype] = [];
    }
    categorized[etype].push(item);
  });

  let typeIndex = 0;
  for (const [errorType, errors] of Object.entries(categorized)) {
    const outerItemId = `type-${typeIndex}`;
    const headingId = `heading-${outerItemId}`;
    const collapseId = `collapse-${outerItemId}`;

    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';

    accordionItem.innerHTML = `
      <h2 class="accordion-header" id="${headingId}">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#${collapseId}"
          aria-expanded="false"
          aria-controls="${collapseId}"
        >
          ${errorType}
          <span class="ms-2 text-muted">
            (${teamMapping[errorType] || 'Unassigned Team'})
          </span>
        </button>
      </h2>
      <div
        id="${collapseId}"
        class="accordion-collapse collapse"
        aria-labelledby="${headingId}"
        data-bs-parent="#errorTypeAccordion"
      >
        <div class="accordion-body">
          <div class="accordion" id="innerAccordion-${outerItemId}">
          </div>
        </div>
      </div>
    `;
    outerAccordion.appendChild(accordionItem);

    // Create nested accordion
    const innerAccordion = accordionItem.querySelector(`#innerAccordion-${outerItemId}`);
    let errorIndex = 0;
    errors.forEach(err => {
      const innerItemId = `err-${typeIndex}-${errorIndex}`;
      const innerHeadingId = `heading-${innerItemId}`;
      const innerCollapseId = `collapse-${innerItemId}`;

      const nestedItem = document.createElement('div');
      nestedItem.className = 'accordion-item';

      nestedItem.innerHTML = `
        <h2 class="accordion-header" id="${innerHeadingId}">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#${innerCollapseId}"
            aria-expanded="false"
            aria-controls="${innerCollapseId}"
          >
            Error ID: ${err._id}
          </button>
        </h2>
        <div
          id="${innerCollapseId}"
          class="accordion-collapse collapse"
          aria-labelledby="${innerHeadingId}"
          data-bs-parent="#innerAccordion-${outerItemId}"
        >
          <div class="accordion-body">
            <strong>Error Details:</strong> ${err.error_details}
          </div>
        </div>
      `;
      innerAccordion.appendChild(nestedItem);
      errorIndex++;
    });

    typeIndex++;
  }
}

/**
 * Filter errors by error_type
 */
function filterByErrorType(searchTerm) {
  if (!searchTerm) {
    // Reset to original data
    renderStats(originalData);
    renderAccordions(originalData);
    return;
  }
  // Filter by partial match on error_type
  const filtered = originalData.filter(
    err => err.error_type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  renderStats(filtered);
  renderAccordions(filtered);
}

if (typeof module !== "undefined") {
    module.exports = { filterByErrorType, renderStats, renderAccordions };
  }
  
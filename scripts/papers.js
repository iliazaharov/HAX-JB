// ─────────────────────────────────────────────────────────────
// 1.  CONFIG
// ─────────────────────────────────────────────────────────────
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6TpxwLlvZ1WZiK2780VY-aik-yuFLnsbrL6Oqte3qe5eKpYUEot8Jsc48TheCiANQmMEMuNvHkOqu/pub?output=csv";

const columns = [
    { title: "Title",        field: "Title", widthGrow: 2 },
    { title: "Authors",      field: "Authors" },
    { title: "Affiliation",  field: "Affiliation" },
    { title: "DOI",          field: "DOI",
        formatter: "link", formatterParams: { target: "_blank" } },
    { title: "Date",         field: "Date", sorter: "date", width: 85 },
    { title: "Venue",        field: "Venue" },
    { title: "Goal",         field: "Goal",               widthGrow: 2 },
    { title: "Research Questions", field: "Research Questions", widthGrow: 2 },
    { title: "Key Findings", field: "Key Findings",       widthGrow: 2 },
    { title: "Future Work",  field: "Future Work",        widthGrow: 2 },
    { title: "Scope",        field: "Scope" },        // alias filled in parser
    { title: "SDLC Stage",   field: "SDLC stage from waterfall" },
    { title: "Context",      field: "Context" },
    { title: "Eligibility",  field: "Eligibility score", hozAlign: "right" },
];

// ─────────────────────────────────────────────────────────────
// 2.  BUILD TABLE
// ─────────────────────────────────────────────────────────────
const table = new Tabulator("#papers-table", {
    layout: "fitColumns",
    placeholder: "Loading…",
    columns,
});

// ─────────────────────────────────────────────────────────────
// 3.  COLUMN CHECK‑BOXES
// ─────────────────────────────────────────────────────────────
const controls = document.getElementById("columnControls");

columns.forEach(col => {
    const id = "col_" + col.field.replace(/\s+/g, "_");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.id = id;
    check.checked = true;

    check.addEventListener("change", () => {
        const column = table.getColumn(col.field);
        if (check.checked) { column.show(); } else { column.hide(); }
    });

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = col.title;
    label.style.marginRight = "0.75rem";

    controls.appendChild(check);
    controls.appendChild(label);
});

// ─────────────────────────────────────────────────────────────
// 4.  LOAD DATA
// ─────────────────────────────────────────────────────────────
Papa.parse(CSV_URL, {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: results => table.setData(
        results.data.map(row => ({
            ...row,
            Scope: row["Scope from our taxonomy"],   // alias for shorter header
        }))
    ),
    error: err => console.error("CSV load error:", err),
});

// ─────────────────────────────────────────────────────────────
// 5.  GROUP‑BY CONTROL
// ─────────────────────────────────────────────────────────────
document.getElementById("groupBySelect").addEventListener("change", e => {
    const col = e.target.value;
    if (!col) { table.setGroupBy(false); return; }

    table.setGroupBy(data => {
        let raw = (data[col] || "").toString();

        if (col === "Affiliation") {
            if (raw.includes("Academia") && raw.includes("Industry")) {
                return "Academia & Industry";
            }
        }
        if (col === "Scope") {
            raw = raw.split(",")[0];
        }
        return raw.trim();
    });
});

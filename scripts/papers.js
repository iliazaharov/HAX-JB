// ─────────────────────────────────────────────────────────────
// 1.  CONFIG
// ─────────────────────────────────────────────────────────────
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6TpxwLlvZ1WZiK2780VY-aik-yuFLnsbrL6Oqte3qe5eKpYUEot8Jsc48TheCiANQmMEMuNvHkOqu/pub?output=csv";

// Full column set, in the order you listed
const columns = [
    { title:"Title",        field:"Title"},
    { title:"Authors",      field:"Authors" },
    { title:"Affiliation",  field:"Affiliation" },
    { title:"DOI",          field:"DOI",
        formatter:"link", formatterParams:{ target:"_blank" } },
    { title:"Date",         field:"Date",         sorter:"date", width:85 },
    { title:"Venue",        field:"Venue" },
    { title:"Goal",         field:"Goal",         widthGrow:2 },
    { title:"Research Questions", field:"Research Questions", widthGrow:2 },
    { title:"Key Findings", field:"Key Findings", widthGrow:2 },
    { title:"Future Work",  field:"Future Work",  widthGrow:2 },
    { title:"Scope",        field:"Scope from our taxonomy" }, // shortened alias
    { title:"SDLC Stage",   field:"SDLC stage from waterfall" },
    { title:"Context",      field:"Context" },
    { title:"Eligibility",  field:"Eligibility score", hozAlign:"right" },
];

// ─────────────────────────────────────────────────────────────
// 2.  BUILD TABLE
// ─────────────────────────────────────────────────────────────
const table = new Tabulator("#papers-table", {
    layout:"fitColumns",
    placeholder:"Loading…",
    columns,
});

// ─────────────────────────────────────────────────────────────
// 3.  LOAD DATA
// ─────────────────────────────────────────────────────────────
Papa.parse(CSV_URL, {
    download:true,
    header:true,
    dynamicTyping:true,
    complete:results => table.setData(
        results.data.map(row => ({
            ...row,
            // give Tabulator a short alias so dropdown works
            "Scope": row["Scope from our taxonomy"]
        }))
    ),
    error:err => console.error("CSV load error:", err),
});

// ─────────────────────────────────────────────────────────────
// 4.  GROUP‑BY CONTROL  (search block deleted)
// ─────────────────────────────────────────────────────────────
document.getElementById("groupBySelect").addEventListener("change", e => {
    const col = e.target.value;
    if (!col) {            // “(None)”
        table.setGroupBy(false);
        return;
    }

    table.setGroupBy(function (data) {   // ← data object, not RowComponent
        let raw = (data[col] || "").toString();

        // Normalise mixed values to tidy group labels
        if (col === "Affiliation") {
            if (raw.includes("Academia") && raw.includes("Industry")) {
                return "Academia & Industry";
            }
        }
        if (col === "Scope") {             // keep first tag only
            raw = raw.split(",")[0];
        }
        return raw.trim();
    });
});


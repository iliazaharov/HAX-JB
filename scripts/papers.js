// ─────────────────────────────────────────────────────────────
// 1.  CONFIG
// ─────────────────────────────────────────────────────────────
const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6TpxwLlvZ1WZiK2780VY-aik-yuFLnsbrL6Oqte3qe5eKpYUEot8Jsc48TheCiANQmMEMuNvHkOqu/pub?output=csv";

// Columns visible on first load
const DEFAULT_COLS = ["Title", "Authors", "Date", "Venue", "Research Questions"];

const columns = [
    { title:"Title",    field:"Title", widthGrow:2,  visible:DEFAULT_COLS.includes("Title") },
    { title:"Authors",  field:"Authors",             visible:DEFAULT_COLS.includes("Authors") },
    { title:"Affiliation", field:"Affiliation",      visible:DEFAULT_COLS.includes("Affiliation") },
    { title:"DOI", field:"DOI",
        formatter:"link", formatterParams:{ target:"_blank" },
        visible:DEFAULT_COLS.includes("DOI") },
    { title:"Date",     field:"Date", sorter:"date", width:85,
        visible:DEFAULT_COLS.includes("Date") },
    { title:"Venue",    field:"Venue",
        visible:DEFAULT_COLS.includes("Venue") },
    { title:"Goal",     field:"Goal", widthGrow:2,
        visible:DEFAULT_COLS.includes("Goal") },
    { title:"Research Questions", field:"Research Questions", widthGrow:2,
        visible:DEFAULT_COLS.includes("Research Questions") },
    { title:"Key Findings", field:"Key Findings", widthGrow:2,
        visible:DEFAULT_COLS.includes("Key Findings") },
    { title:"Future Work", field:"Future Work", widthGrow:2,
        visible:DEFAULT_COLS.includes("Future Work") },
    { title:"Scope",    field:"Scope",
        visible:DEFAULT_COLS.includes("Scope") },
    { title:"SDLC Stage", field:"SDLC stage from waterfall",
        visible:DEFAULT_COLS.includes("SDLC stage from waterfall") },
    { title:"Context",  field:"Context",
        visible:DEFAULT_COLS.includes("Context") },
    { title:"Eligibility", field:"Eligibility score", hozAlign:"right",
        visible:DEFAULT_COLS.includes("Eligibility score") },
];

// ─────────────────────────────────────────────────────────────
// 2.  BUILD TABLE
// ─────────────────────────────────────────────────────────────
const table = new Tabulator("#papers-table", {
    layout:"fitColumns",
    height:600,            // vertical scroll
    rowHeight:60,
    placeholder:"Loading…",
    columns,
});

// ─────────────────────────────────────────────────────────────
// 3.  COLUMN TOGGLES
// ─────────────────────────────────────────────────────────────
const controls = document.getElementById("columnControls");

columns.forEach(col => {
    const id = "col_" + col.field.replace(/\s+/g,"_");
    const box = Object.assign(document.createElement("input"),
        { type:"checkbox", id, checked:col.visible });
    box.addEventListener("change", () => {
        const column = table.getColumn(col.field);
        box.checked ? column.show() : column.hide();
    });
    const label = document.createElement("label");
    label.htmlFor = id; label.textContent = col.title;
    controls.appendChild(box); controls.appendChild(label);
});

// ─────────────────────────────────────────────────────────────
// 4.  LOAD DATA
// ─────────────────────────────────────────────────────────────
Papa.parse(CSV_URL,{
    download:true, header:true, dynamicTyping:true,
    complete:results => table.setData(
        results.data.map(row => ({
            ...row,
            Scope:row["Scope from our taxonomy"],    // alias
        }))
    ),
    error:err => console.error("CSV load error:",err)
});

// ─────────────────────────────────────────────────────────────
// 5.  GROUP-BY CONTROL
// ─────────────────────────────────────────────────────────────
document.getElementById("groupBySelect").addEventListener("change", e => {
    const col = e.target.value;
    if(!col){ table.setGroupBy(false); return; }

    table.setGroupBy(data => {
        let raw = (data[col]||"").toString();
        if(col==="Affiliation" && raw.includes("Academia") && raw.includes("Industry"))
            return "Academia & Industry";
        if(col==="Scope") raw = raw.split(",")[0];
        return raw.trim();
    });
});

// ─────────────────────────────────────────────────────────────
// 6.  GLOBAL SEARCH
// ─────────────────────────────────────────────────────────────
const globalSearch = document.getElementById("globalSearch");

globalSearch.addEventListener("input", () => {
    const term = globalSearch.value.toLowerCase();
    if(!term){
        table.clearFilter();
        return;
    }
    table.setFilter(row => {
        return Object.values(row.getData())
            .some(v => String(v).toLowerCase().includes(term));
    });
});

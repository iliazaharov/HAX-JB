document.addEventListener("DOMContentLoaded", function() {
    console.log("papers.js loaded");

    let googleCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkIZurSAcU-SJokww4E6p039pnJykcGCspaktlNjNJkvaGN_LBGEMliUSwda26pT84Z1rRPXUHTV4b/pub?output=csv&single=true";

    let table = new Tabulator("#papers-table", {
        height: "500px",
        layout: "fitData",
        ajaxURL: googleCsvUrl,
        // Override the default AJAX request so we fetch plain text
        ajaxRequestFunc: function(url, config, params) {
            return fetch(url).then(response => response.text());
        },
        ajaxResponse: function(url, params, response) {
            // Parse CSV using PapaParse with headers inferred from the CSV
            let parsed = Papa.parse(response, { header: true });
            console.log("Parsed CSV Data:", parsed.data);
            return parsed.data;
        },
        columns: [
            {
                title: "Paper",
                field: "Paper",
                widthGrow: 2,
                formatter: function(cell) {
                    let rowData = cell.getRow().getData();
                    // Use the Link field from CSV to create a clickable title
                    return `<a href="${rowData.Link}" target="_blank">${rowData.Paper}</a>`;
                }
            },
            { title: "Auth", field: "Auth" },
            { title: "Tax", field: "Tax" },
        ],
    });

    // Grouping logic (update select options accordingly if needed)
    let groupBySelect = document.getElementById("groupBySelect");
    groupBySelect.addEventListener("change", function() {
        let groupField = groupBySelect.value;
        table.setGroupBy(groupField || null);
    });

    // Search logic: update filtering to match CSV header names
    let searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("keyup", function() {
        let query = searchInput.value.toLowerCase();
        table.setFilter((data) => {
            return (
                data.Paper?.toLowerCase().includes(query) ||
                data.Auth?.toLowerCase().includes(query) ||
                data.Tax?.toLowerCase().includes(query)
            );
        });
    });
});

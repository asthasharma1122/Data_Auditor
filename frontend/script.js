
// ========================================
// DataAuditor - Frontend JavaScript
// ========================================

// 1. Select HTML elements

let missingChartInstance = null;
let outlierChartInstance = null;

const auditButton = document.getElementById("auditButton");
const fileInput = document.getElementById("csvFile");
const targetColumn = document.getElementById("targetColumn");

const status = document.getElementById("status");

const totalRows = document.getElementById("totalRows");
const totalColumns = document.getElementById("totalColumns");
const missingCount = document.getElementById("missingCount");
const outlierCount = document.getElementById("outlierCount");

const missingReport = document.getElementById("missingReport");
const outlierReport = document.getElementById("outlierReport");
const leakageReport = document.getElementById("leakageReport");


// 2. Listen for button click

auditButton.addEventListener("click", async function () {

    const file = fileInput.files[0];

    // Validate file selection

    if (!file) {
        status.textContent = "Please select a CSV file first.";
        return;
    }

    // Validate file extension

    if (!file.name.toLowerCase().endsWith(".csv")) {
        status.textContent = "Please upload a valid CSV file.";
        return;
    }

    // Prepare form data

    const formData = new FormData();

    formData.append("file", file);

    if (targetColumn.value.trim() !== "") {
        formData.append("target_col", targetColumn.value.trim());
    }

    // Update UI before API request

    auditButton.disabled = true;
    status.textContent = "Analyzing your dataset...";

    clearDashboard();

    try {

        // 3. Send POST request to Flask backend

        const response = await fetch(
            "http://127.0.0.1:5000/api/audit",
            {
                method: "POST",
                body: formData
            }
        );

        // 4. Convert response into JavaScript object

        const data = await response.json();

        // Handle backend errors

        if (!response.ok) {
            throw new Error(data.error || "Audit failed.");
        }

        // 5. Display audit results

        displaySummary(data);
        displayMissingValues(data.missing_values);
        displayOutliers(data.outliers);
        displayLeakage(data.leakage);

        // Create charts using API results

        updateCharts(data);

        status.textContent = "Audit completed successfully!";

    }

    catch (error) {

        status.textContent = "Error: " + error.message;

        console.error("Audit Error:", error);

    }

    finally {

        // Re-enable button after request

        auditButton.disabled = false;

    }

});


// ========================================
// 6. Clear previous dashboard results
// ========================================

function clearDashboard() {

    totalRows.textContent = "0";
    totalColumns.textContent = "0";
    missingCount.textContent = "0";
    outlierCount.textContent = "0";

    missingReport.textContent = "";
    outlierReport.textContent = "";
    leakageReport.textContent = "";

    // Destroy previous charts

    if (missingChartInstance) {
        missingChartInstance.destroy();
        missingChartInstance = null;
    }

    if (outlierChartInstance) {
        outlierChartInstance.destroy();
        outlierChartInstance = null;
    }

}


// ========================================
// 7. Display dataset summary
// ========================================

function displaySummary(data) {

    totalRows.textContent = data.summary.total_rows;

    totalColumns.textContent = data.summary.total_columns;

    // Calculate total missing values

    const missingTotal = Object.values(data.missing_values)
        .reduce((sum, item) => sum + item.count, 0);

    missingCount.textContent = missingTotal;

    // Count columns containing outliers

    outlierCount.textContent = Object.keys(data.outliers).length;

}


// ========================================
// 8. Display missing value analysis
// ========================================

function displayMissingValues(missingValues) {

    missingReport.textContent = "";

    if (Object.keys(missingValues).length === 0) {

        missingReport.textContent = "No missing values found.";

        return;

    }

    for (const [column, details] of Object.entries(missingValues)) {

        const p = document.createElement("p");

        p.textContent =
            `${column}: ${details.count} missing values (${details.percentage}%)`;

        missingReport.appendChild(p);

    }

}


// ========================================
// 9. Display outlier analysis
// ========================================

function displayOutliers(outliers) {

    outlierReport.textContent = "";

    if (Object.keys(outliers).length === 0) {

        outlierReport.textContent = "No outliers detected.";

        return;

    }

    for (const [column, details] of Object.entries(outliers)) {

        const p = document.createElement("p");

        p.textContent =
            `${column}: ${details.count} outliers (${details.percentage}%)`;

        outlierReport.appendChild(p);

        const bounds = document.createElement("p");

        bounds.textContent =
            `Lower bound: ${details.lower_bound} | Upper bound: ${details.upper_bound}`;

        outlierReport.appendChild(bounds);

    }

}


// ========================================
// 10. Display data leakage analysis
// ========================================

function displayLeakage(leakage) {

    leakageReport.textContent = "";

    if (leakage.length === 0) {

        leakageReport.textContent =
            "No potential data leakage detected.";

        return;

    }

    leakage.forEach(item => {

        const p = document.createElement("p");

        p.textContent = `${item.column}: ${item.issue}`;

        leakageReport.appendChild(p);

        if (item.correlation !== undefined) {

            const correlation = document.createElement("p");

            correlation.textContent =
                `Correlation: ${item.correlation}`;

            leakageReport.appendChild(correlation);

        }

    });

}


// ========================================
// 11. Create Chart.js visualizations
// ========================================

function updateCharts(data) {

    // Prepare missing-value chart data

    const missingLabels = Object.keys(data.missing_values);

    const missingCounts = missingLabels.map(
        column => data.missing_values[column].count
    );

    // Prepare outlier chart data

    const outlierLabels = Object.keys(data.outliers);

    const outlierCounts = outlierLabels.map(
        column => data.outliers[column].count
    );

    // Check Chart.js availability

    if (typeof Chart === "undefined") {
        console.error("Chart.js has not loaded.");
        status.textContent =
            "Audit completed, but charts could not load. Check your internet connection.";
        return;
    }

    // Missing values chart

    missingChartInstance = new Chart(
        document.getElementById("missingChart"),
        {
            type: "bar",

            data: {
                labels: missingLabels,

                datasets: [{
                    label: "Missing Values",
                    data: missingCounts,
                    backgroundColor: "#3b82f6",
                    borderRadius: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        labels: {
                            color: "#e2e8f0"
                        }
                    }
                },

                scales: {
                    x: {
                        ticks: {
                            color: "#cbd5e1"
                        },
                        grid: {
                            color: "#334155"
                        }
                    },

                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "#cbd5e1",
                            precision: 0
                        },
                        grid: {
                            color: "#334155"
                        }
                    }
                }
            }
        }
    );


    // Outliers chart

    outlierChartInstance = new Chart(
        document.getElementById("outlierChart"),
        {
            type: "bar",

            data: {
                labels: outlierLabels,

                datasets: [{
                    label: "Outliers",
                    data: outlierCounts,
                    backgroundColor: "#f59e0b",
                    borderRadius: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        labels: {
                            color: "#e2e8f0"
                        }
                    }
                },

                scales: {
                    x: {
                        ticks: {
                            color: "#cbd5e1"
                        },
                        grid: {
                            color: "#334155"
                        }
                    },

                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "#cbd5e1",
                            precision: 0
                        },
                        grid: {
                            color: "#334155"
                        }
                    }
                }
            }
        }
    );

}

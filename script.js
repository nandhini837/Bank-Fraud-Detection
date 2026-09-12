// ============================================================
// BANK FRAUD DETECTION - FRONTEND JAVASCRIPT
// ============================================================


// ============================================================
// CHECK FRAUD
// ============================================================

async function checkFraud() {

    const transaction = {
        Time: Number(document.getElementById("Time").value),
        Amount: Number(document.getElementById("Amount").value)
    };

    // Get V1 to V28
    for (let i = 1; i <= 28; i++) {

        const input = document.getElementById(`V${i}`);

        transaction[`V${i}`] = Number(input.value);
    }


    // ========================================================
    // INPUT VALIDATION
    // ========================================================

    if (!Number.isFinite(transaction.Time)) {

        alert("Please enter a valid transaction time.");
        return;
    }


    if (transaction.Time < 0) {

        alert("Transaction time cannot be negative.");
        return;
    }


    if (!Number.isFinite(transaction.Amount)) {

        alert("Please enter a valid transaction amount.");
        return;
    }


    if (transaction.Amount < 0) {

        alert("Transaction amount cannot be negative.");
        return;
    }


    for (let i = 1; i <= 28; i++) {

        if (!Number.isFinite(transaction[`V${i}`])) {

            alert(`Please enter a valid value for V${i}.`);
            return;
        }
    }


    // ========================================================
    // BUTTON LOADING STATE
    // ========================================================

    const button = document.getElementById("predictBtn");

    if (button) {

        button.disabled = true;
        button.textContent = "⏳ Checking...";
    }


    try {

        // ====================================================
        // SEND DATA TO BACKEND
        // ====================================================

        const response = await fetch(
            "http://127.0.0.1:8000/predict",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(transaction)
            }
        );


        // ====================================================
        // HANDLE SERVER ERROR
        // ====================================================

        if (!response.ok) {

            let errorMessage = `Server error: ${response.status}`;

            try {

                const errorData = await response.json();

                if (errorData.detail) {

                    errorMessage = errorData.detail;
                }

            } catch (error) {
                // Ignore JSON parsing error
            }

            throw new Error(errorMessage);
        }


        const result = await response.json();


        // ====================================================
        // HANDLE BACKEND PREDICTION ERROR
        // ====================================================

        if (result.error) {

            alert(
                "Prediction failed.\n\n" +
                result.details
            );

            return;
        }


        // ====================================================
        // DISPLAY RESULT
        // ====================================================

        displayPredictionResult(result);


        // ====================================================
        // SAVE HISTORY
        // ====================================================

        saveTransactionHistory(
            transaction,
            result
        );

    }

    catch (error) {

        console.error("Prediction error:", error);

        alert(
            "Unable to connect to backend.\n\n" +
            "Please make sure the FastAPI server is running."
        );

    }

    finally {

        if (button) {

            button.disabled = false;
            button.textContent = "🔍 Check Transaction";
        }
    }
}



// ============================================================
// DISPLAY PREDICTION RESULT
// ============================================================

function displayPredictionResult(result) {

    const resultSection =
        document.getElementById("resultSection");

    const predictionElement =
        document.getElementById("prediction");

    const probabilityElement =
        document.getElementById("probability");

    const riskElement =
        document.getElementById("risk");

    const resultBox =
        document.getElementById("resultBox");

    const predictionBanner =
        document.getElementById("predictionBanner");

    const predictionIcon =
        document.getElementById("predictionIcon");


    // ========================================================
    // GET RESULT VALUES
    // ========================================================

    const prediction =
        result.prediction || "Unknown";

    const probability =
        Number(result.fraud_probability || 0);

    const risk =
        result.risk_level || "Unknown";


    const probabilityPercent =
        (probability * 100).toFixed(2);


    // ========================================================
    // UPDATE RESULT SECTION
    // ========================================================

    if (predictionElement) {

        predictionElement.textContent =
            prediction;
    }


    if (probabilityElement) {

        probabilityElement.textContent =
            `${probabilityPercent}%`;
    }


    if (riskElement) {

        riskElement.textContent =
            risk;
    }


    // ========================================================
    // UPDATE DASHBOARD CARDS
    // ========================================================

    const dashboardPrediction =
        document.getElementById("dashboardPrediction");

    const dashboardProbability =
        document.getElementById("dashboardProbability");

    const dashboardRisk =
        document.getElementById("dashboardRisk");


    if (dashboardPrediction) {

        dashboardPrediction.textContent =
            prediction;
    }


    if (dashboardProbability) {

        dashboardProbability.textContent =
            `${probabilityPercent}%`;
    }


    if (dashboardRisk) {

        dashboardRisk.textContent =
            risk;
    }


    // ========================================================
    // UPDATE RESULT ICON
    // ========================================================

    if (predictionIcon) {

        if (prediction === "Fraud") {

            predictionIcon.textContent = "🚨";

        } else {

            predictionIcon.textContent = "🛡️";
        }
    }


    // ========================================================
    // UPDATE RESULT BANNER
    // ========================================================

    if (predictionBanner) {

        predictionBanner.classList.remove(
            "fraud",
            "safe"
        );


        if (prediction === "Fraud") {

            predictionBanner.classList.add("fraud");

        } else {

            predictionBanner.classList.add("safe");
        }
    }


    // ========================================================
    // UPDATE RESULT BOX
    // ========================================================

    if (resultBox) {

        resultBox.classList.remove(
            "fraud",
            "safe"
        );


        if (prediction === "Fraud") {

            resultBox.classList.add("fraud");

        } else {

            resultBox.classList.add("safe");
        }
    }


    // ========================================================
    // SHOW RESULT SECTION
    // ========================================================

    if (resultSection) {

        resultSection.style.display = "block";
    }


    // ========================================================
    // DISPLAY SHAP EXPLANATION
    // ========================================================

    displayExplanation(
        result.explanation || []
    );
}



// ============================================================
// DISPLAY SHAP EXPLANATION
// ============================================================

function displayExplanation(explanation) {

    const container =
        document.getElementById(
            "explanationContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!explanation || explanation.length === 0) {

        container.innerHTML = `
            <p class="no-result">
                No explanation available.
            </p>
        `;

        return;
    }


    explanation.forEach(item => {

        const feature =
            item.feature || "Unknown";

        const impact =
            Number(item.impact || 0);


        const row =
            document.createElement("div");


        row.className =
            "explanation-item";


        const impactText =
            impact >= 0
                ? `+${impact.toFixed(4)}`
                : impact.toFixed(4);


        row.innerHTML = `

            <span class="explanation-feature">
                ${feature}
            </span>

            <strong class="explanation-impact">
                SHAP Impact: ${impactText}
            </strong>

        `;


        container.appendChild(row);

    });
}



// ============================================================
// SAVE TRANSACTION HISTORY
// ============================================================

function saveTransactionHistory(
    transaction,
    result
) {

    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "transactionHistory"
                )
            ) || [];

    } catch (error) {

        history = [];
    }


    const historyItem = {

        transaction: transaction,

        prediction:
            result.prediction || "Unknown",

        fraud_probability:
            Number(
                result.fraud_probability || 0
            ),

        risk_level:
            result.risk_level || "Unknown",

        explanation:
            result.explanation || [],

        timestamp:
            new Date().toLocaleString()
    };


    history.push(historyItem);


    // Keep only the latest 10 transactions

    if (history.length > 10) {

        history =
            history.slice(-10);
    }


    localStorage.setItem(
        "transactionHistory",
        JSON.stringify(history)
    );


    // Update dashboard information

    displayTransactionHistory();

    loadDashboardCount();

    updateSecuritySummary();

    updateFraudChart();
}



// ============================================================
// DISPLAY TRANSACTION HISTORY
// ============================================================

function displayTransactionHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "transactionHistory"
                )
            ) || [];

    } catch (error) {

        history = [];
    }


    if (history.length === 0) {

        container.innerHTML = `
            <p class="no-history">
                No transactions analyzed yet.
            </p>
        `;

        return;
    }


    // ========================================================
    // CREATE TABLE
    // ========================================================

    const table =
        document.createElement("table");


    table.className =
        "history-table";


    // ========================================================
    // TABLE HEADER
    // ========================================================

    table.innerHTML = `

        <thead>

            <tr>

                <th>Time</th>

                <th>Amount</th>

                <th>Prediction</th>

                <th>Probability</th>

                <th>Risk</th>

            </tr>

        </thead>

        <tbody></tbody>
    `;


    const tbody =
        table.querySelector("tbody");


    // ========================================================
    // CREATE HISTORY ROWS
    // ========================================================

    history
        .slice()
        .reverse()
        .forEach(item => {

            // Ignore damaged old records

            if (
                !item ||
                !item.transaction
            ) {
                return;
            }


            const transaction =
                item.transaction;


            const time =
                Number(transaction.Time);


            const amount =
                Number(transaction.Amount);


            const probability =
                Number(
                    item.fraud_probability
                );


            const prediction =
                item.prediction ||
                "Unknown";


            const risk =
                item.risk_level ||
                "Unknown";


            // Skip invalid old records

            if (
                !Number.isFinite(time) ||
                !Number.isFinite(amount) ||
                !Number.isFinite(probability)
            ) {
                return;
            }


            const row =
                document.createElement("tr");


            const predictionIcon =
                prediction === "Fraud"
                    ? "🚨"
                    : "🛡️";


            row.innerHTML = `

                <td>
                    ${time}
                </td>

                <td>
                    ₹${amount.toFixed(2)}
                </td>

                <td>
                    ${predictionIcon}
                    ${prediction}
                </td>

                <td>
                    ${(probability * 100).toFixed(2)}%
                </td>

                <td>
                    ${risk}
                </td>

            `;


            tbody.appendChild(row);

        });


    container.appendChild(table);
}



// ============================================================
// CLEAR HISTORY
// ============================================================

function clearHistory() {

    const confirmClear =
        confirm(
            "Are you sure you want to clear all transaction history?"
        );


    if (!confirmClear) {
        return;
    }


    localStorage.removeItem(
        "transactionHistory"
    );


    displayTransactionHistory();

    loadDashboardCount();

    updateSecuritySummary();

    updateFraudChart();


    // Reset dashboard cards

    const dashboardPrediction =
        document.getElementById(
            "dashboardPrediction"
        );

    const dashboardProbability =
        document.getElementById(
            "dashboardProbability"
        );

    const dashboardRisk =
        document.getElementById(
            "dashboardRisk"
        );


    if (dashboardPrediction) {

        dashboardPrediction.textContent =
            "---";
    }


    if (dashboardProbability) {

        dashboardProbability.textContent =
            "---";
    }


    if (dashboardRisk) {

        dashboardRisk.textContent =
            "---";
    }
}



// ============================================================
// LOAD DASHBOARD COUNT
// ============================================================

function loadDashboardCount() {

    const countElement =
        document.getElementById(
            "transactionCount"
        );


    if (!countElement) {
        return;
    }


    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "transactionHistory"
                )
            ) || [];

    } catch (error) {

        history = [];
    }


    countElement.textContent =
        history.length;
}



// ============================================================
// UPDATE SECURITY SUMMARY
// ============================================================

function updateSecuritySummary() {

    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "transactionHistory"
                )
            ) || [];

    } catch (error) {

        history = [];
    }


    const total =
        history.length;


    const fraudCount =
        history.filter(
            item =>
                item &&
                item.prediction === "Fraud"
        ).length;


    const safeCount =
        total - fraudCount;


    const fraudRate =
        total > 0
            ? (fraudCount / total) * 100
            : 0;


    const totalElement =
        document.getElementById(
            "summaryTotal"
        );

    const fraudElement =
        document.getElementById(
            "summaryFraud"
        );

    const safeElement =
        document.getElementById(
            "summarySafe"
        );

    const rateElement =
        document.getElementById(
            "summaryRate"
        );


    if (totalElement) {

        totalElement.textContent =
            total;
    }


    if (fraudElement) {

        fraudElement.textContent =
            fraudCount;
    }


    if (safeElement) {

        safeElement.textContent =
            safeCount;
    }


    if (rateElement) {

        rateElement.textContent =
            `${fraudRate.toFixed(2)}%`;
    }
}



// ============================================================
// FRAUD ANALYTICS CHART
// ============================================================

let fraudChart = null;


function updateFraudChart() {

    const canvas =
        document.getElementById(
            "fraudChart"
        );


    if (!canvas) {
        return;
    }


    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    "transactionHistory"
                )
            ) || [];

    } catch (error) {

        history = [];
    }


    const fraudCount =
        history.filter(
            item =>
                item &&
                item.prediction === "Fraud"
        ).length;


    const safeCount =
        history.filter(
            item =>
                item &&
                item.prediction === "Not Fraud"
        ).length;


    // Destroy old chart

    if (fraudChart) {

        fraudChart.destroy();

        fraudChart = null;
    }


    // Chart.js must be loaded

    if (
        typeof Chart === "undefined"
    ) {

        console.error(
            "Chart.js is not loaded."
        );

        return;
    }


    fraudChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: [
                        "Safe Transactions",
                        "Fraud Transactions"
                    ],

                    datasets: [

                        {
                            label:
                                "Number of Transactions",

                            data: [
                                safeCount,
                                fraudCount
                            ],

                            backgroundColor: [
                                "#22c55e",
                                "#ef4444"
                            ],

                            borderWidth: 0
                        }

                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                precision: 0
                            },

                            title: {

                                display: true,

                                text:
                                    "Number of Transactions"
                            }
                        },

                        x: {

                            title: {

                                display: true,

                                text:
                                    "Transaction Type"
                            }
                        }
                    },

                    plugins: {

                        legend: {

                            display: false
                        }
                    }
                }
            }
        );
}



// ============================================================
// LOAD NORMAL SAMPLE
// ============================================================

function loadNormalSample() {

    document.getElementById(
        "Time"
    ).value = 50000;


    document.getElementById(
        "Amount"
    ).value = 50;


    const normalValues = [

        -1.359807,
        -0.072781,
        2.536347,
        1.378155,
        -0.338321,
        0.462388,
        0.239599,
        0.098698,
        0.363787,
        0.090794,
        -0.551600,
        -0.617801,
        -0.991390,
        -0.311169,
        1.468177,
        -0.470401,
        0.207971,
        0.025791,
        0.403993,
        0.251412,
        -0.018307,
        0.277838,
        -0.110474,
        0.066928,
        0.128539,
        -0.189115,
        0.133558,
        -0.021053
    ];


    for (let i = 1; i <= 28; i++) {

        document.getElementById(
            `V${i}`
        ).value =
            normalValues[i - 1];
    }


    alert(
        "Normal transaction sample loaded."
    );
}



// ============================================================
// LOAD FRAUD SAMPLE
// ============================================================

function loadFraudSample() {

    document.getElementById(
        "Time"
    ).value = 50000;


    document.getElementById(
        "Amount"
    ).value = 100;


    const fraudValues = [

        -2.312227,
        1.951992,
        -1.609851,
        3.997906,
        -0.522188,
        -1.426545,
        -2.537387,
        1.391657,
        -2.770089,
        -2.772272,
        3.202033,
        -2.899907,
        -0.595222,
        -4.289254,
        0.389724,
        -1.140747,
        -2.830056,
        -0.016823,
        0.416956,
        0.126911,
        0.517232,
        -0.035049,
        -0.465211,
        0.320198,
        0.044519,
        0.177839,
        0.261145,
        -0.143276
    ];


    for (let i = 1; i <= 28; i++) {

        document.getElementById(
            `V${i}`
        ).value =
            fraudValues[i - 1];
    }


    alert(
        "Fraud transaction sample loaded."
    );
}



// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayTransactionHistory();

        loadDashboardCount();

        updateSecuritySummary();

        updateFraudChart();

    }
);
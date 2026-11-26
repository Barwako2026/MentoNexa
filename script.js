"use strict";

// ======================================
// MENTONEXA APPLICATION
// ======================================

const STORAGE_KEY = "mentonexaRequests";
const DEMO_ADMIN_PASSWORD = "Admin@123";

// Connect to HTML elements.

const mentorForm = document.getElementById("mentorForm");
const selectedMentorInput = document.getElementById("selectedMentor");
const selectedMentorText = document.getElementById("selectedMentorText");
const formMessage = document.getElementById("formMessage");

const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginSection = document.getElementById("adminLoginSection");
const adminDashboard = document.getElementById("adminDashboard");
const loginMessage = document.getElementById("loginMessage");

const requestsTableBody = document.getElementById("requestsTableBody");

// ======================================
// STEP 1: GET SAVED REQUESTS
// ======================================

function getRequests() {
    try {
        const stored = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(stored) ? stored : [];

    } catch (error) {
        console.error("Could not read saved requests:", error);
        return [];
    }
}

// ======================================
// STEP 2: SAVE REQUESTS
// ======================================

function saveRequests(requests) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(requests)
        );

        return true;

    } catch (error) {
        console.error("Could not save requests:", error);
        return false;
    }
}

// ======================================
// STEP 3: SELECT A MENTOR
// ======================================

function selectMentor(mentorName) {

    selectedMentorInput.value = mentorName;

    selectedMentorText.textContent =
        "Selected Mentor: " + mentorName;

    formMessage.textContent = "";

    document.getElementById("request").scrollIntoView({
        behavior: "smooth"
    });
}

document.querySelectorAll(".mentor-btn").forEach((button) => {

    button.addEventListener("click", () => {

        selectMentor(button.dataset.mentor);

    });

});

// ======================================
// STEP 4: SUBMIT MENTORSHIP REQUEST
// ======================================

mentorForm.addEventListener("submit", (event) => {

    event.preventDefault();

    // Check whether a mentor has been selected.

    if (!selectedMentorInput.value) {

        formMessage.textContent =
            "Please select a mentor before submitting.";

        formMessage.style.color = "#b42318";

        document.getElementById("mentors").scrollIntoView({
            behavior: "smooth"
        });

        return;
    }

    // Collect information from the form.

    const request = {

        id: (window.crypto && crypto.randomUUID)
            ? crypto.randomUUID()
            : String(Date.now()),

        name: document.getElementById("name").value.trim(),

        email: document.getElementById("email").value.trim(),

        profession: document.getElementById("profession").value,

        experience: document.getElementById("experience").value.trim(),

        message: document.getElementById("message").value.trim(),

        mentor: selectedMentorInput.value,

        preferredDate:
            document.getElementById("preferredDate").value ||
            "Not specified",

        date: new Date().toLocaleString(),

        status: "Pending"

    };

    // Get previously saved requests.

    const requests = getRequests();

    // Add the new request.

    requests.push(request);

    // Save request to browser storage.

    if (!saveRequests(requests)) {

        formMessage.textContent =
            "Your request could not be saved. Please check your browser storage settings.";

        formMessage.style.color = "#b42318";

        return;
    }

    // Show successful submission message.

    formMessage.textContent =
        "Success! Your mentorship request to " +
        request.mentor +
        " has been submitted.";

    formMessage.style.color = "#16834b";

    // Reset the form.

    mentorForm.reset();

    selectedMentorInput.value = "";

    selectedMentorText.textContent =
        "No mentor selected yet. Choose a mentor above to get started.";

});

// ======================================
// STEP 5: CREATE TABLE CELLS
// ======================================

function createCell(value) {

    const cell = document.createElement("td");

    cell.textContent = value || "Not provided";

    return cell;
}

// ======================================
// STEP 6: CREATE ACTION BUTTONS
// ======================================

function createActionButton(label, className, onClick) {

    const button = document.createElement("button");

    button.type = "button";

    button.textContent = label;

    button.className = className;

    button.addEventListener("click", onClick);

    return button;
}

// ======================================
// STEP 7: UPDATE REQUEST STATUS
// ======================================

function updateRequestStatus(requestId, newStatus) {

    const requests = getRequests();

    const target = requests.find(
        (request) => request.id === requestId
    );

    if (!target) {
        return;
    }

    target.status = newStatus;

    saveRequests(requests);

    renderDashboard();
}

// ======================================
// STEP 8: DELETE ONE REQUEST
// ======================================

function deleteRequest(requestId) {

    const confirmed = window.confirm(
        "Delete this mentorship request? This cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    const requests = getRequests().filter(
        (request) => request.id !== requestId
    );

    saveRequests(requests);

    renderDashboard();
}

// ======================================
// STEP 9: DISPLAY ADMIN DASHBOARD
// ======================================

function renderDashboard() {

    if (!requestsTableBody) {
        return;
    }

    // Retrieve requests.

    const requests = getRequests();

    // Calculate statistics.

    const pending = requests.filter(
        (request) => request.status === "Pending"
    ).length;

    const approved = requests.filter(
        (request) => request.status === "Approved"
    ).length;

    const rejected = requests.filter(
        (request) => request.status === "Rejected"
    ).length;

    // Display statistics.

    document.getElementById("totalRequests").textContent =
        requests.length;

    document.getElementById("pendingRequests").textContent =
        pending;

    document.getElementById("approvedRequests").textContent =
        approved;

    document.getElementById("rejectedRequests").textContent =
        rejected;

    // Clear the previous table.

    requestsTableBody.replaceChildren();

    // Display empty message when there are no requests.

    document.getElementById("emptyRequestsMessage").hidden =
        requests.length > 0;

    // Display each request.

    requests.forEach((request) => {

        const row = document.createElement("tr");

        row.appendChild(createCell(request.name));

        row.appendChild(createCell(request.email));

        row.appendChild(createCell(request.profession));

        row.appendChild(createCell(request.experience));

        row.appendChild(createCell(request.mentor));

        row.appendChild(
            createCell(request.preferredDate || "Not specified")
        );

        // Create status cell.

        const statusCell = document.createElement("td");

        const status = document.createElement("span");

        const statusValue = request.status || "Pending";

        status.className =
            "status status-" + statusValue.toLowerCase();

        status.textContent = statusValue;

        statusCell.appendChild(status);

        row.appendChild(statusCell);

        // Create action buttons.

        const actionsCell = document.createElement("td");

        const approveButton = createActionButton(
            "Approve",
            "approve-button",
            () => updateRequestStatus(request.id, "Approved")
        );

        const rejectButton = createActionButton(
            "Reject",
            "reject-button",
            () => updateRequestStatus(request.id, "Rejected")
        );

        const deleteButton = createActionButton(
            "Delete",
            "delete-button",
            () => deleteRequest(request.id)
        );

        actionsCell.appendChild(approveButton);

        actionsCell.appendChild(rejectButton);

        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);

        requestsTableBody.appendChild(row);

    });
}

// ======================================
// STEP 10: REFRESH DASHBOARD
// ======================================

document.getElementById("refreshRequests").addEventListener(
    "click",
    renderDashboard
);

// ======================================
// STEP 11: CLEAR ALL REQUESTS
// ======================================

document.getElementById("clearAllRequests").addEventListener(
    "click",
    () => {

        const confirmed = window.confirm(
            "Are you sure you want to delete ALL demonstration requests?"
        );

        if (!confirmed) {
            return;
        }

        saveRequests([]);

        renderDashboard();

    }
);

// ======================================
// STEP 12: ADMIN LOGIN
// ======================================

adminLoginForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const enteredPassword =
        document.getElementById("adminPassword").value;

    if (enteredPassword === DEMO_ADMIN_PASSWORD) {

        // Hide administrator login.

        adminLoginSection.hidden = true;

        // Show administrator dashboard.

        adminDashboard.hidden = false;

        loginMessage.textContent = "";

        adminLoginForm.reset();

        // Load mentorship requests.

        renderDashboard();

        adminDashboard.scrollIntoView({
            behavior: "smooth"
        });

    } else {

        loginMessage.textContent =
            "Incorrect password. Please try again.";

        loginMessage.style.color = "#b42318";

    }

});

// ======================================
// STEP 13: ADMIN LOGOUT
// ======================================

document.getElementById("logoutButton").addEventListener(
    "click",
    () => {

        adminDashboard.hidden = true;

        adminLoginSection.hidden = false;

        document.getElementById("adminPassword").value = "";

        adminLoginSection.scrollIntoView({
            behavior: "smooth"
        });

    }
);

// ======================================
// STEP 14: MOBILE NAVIGATION
// ======================================

const menuToggle = document.getElementById("menuToggle");

const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {

    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );

});

// Close mobile navigation after clicking a link.

navLinks.querySelectorAll("a").forEach((link) => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("open");

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.setAttribute("aria-label", "Open navigation");

    });

});
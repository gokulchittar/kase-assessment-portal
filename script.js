// Mock Data for Initial State
const state = {
    stats: {
        assessments: 20510,
        candidates: 25288,
        pass: 91.12,
        fail: 8.88
    },
    breakdown: {
        online: 620,
        offline: 420,
        hybrid: 208
    },
    activity: [
        { date: '2026-01-16', mode: 'Online', candidates: 120, pass: 95, fail: 25 },
        { date: '2026-01-14', mode: 'Offline', candidates: 85, pass: 65, fail: 20 },
        { date: '2025-12-30', mode: 'Hybrid', candidates: 100, pass: 82, fail: 18 },
        { date: '2025-12-29', mode: 'Online', candidates: 75, pass: 60, fail: 15 },
        { date: '2025-12-26', mode: 'Offline', candidates: 110, pass: 90, fail: 20 },
    ]
};

// --- Navigation & View Management ---

function logout() {
    document.getElementById('main-layout').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
    // Reset login form
    document.getElementById('login-form').reset();
}

function showSection(sectionId, title = '') {
    // Update Page Title
    const titleMap = {
        'dashboard': 'Dashboard',
        'training': 'Training Results',
        'add-assessment': 'Add Assessment',
        'placeholder': title || 'Coming Soon'
    };

    document.getElementById('page-title').textContent = titleMap[sectionId] || 'Portal';

    // Hide all sections
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));

    // Show target section
    const target = document.getElementById(sectionId + '-section');
    if (target) {
        target.classList.remove('hidden');
        // Retrigger animation
        target.style.animation = 'none';
        target.offsetHeight; /* trigger reflow */
        target.style.animation = null;
    }

    // Special handling for placeholder content
    if (sectionId === 'placeholder') {
        const descriptions = {
            'Candidate Registration': 'bulk upload features and candidate profile management',
            'Assessor Management': 'full scheduling, certification tracking and deployment tools',
            'Assessment Agencies': 'agency onboarding flows and performance dashboards',
            'Assessment Centres': 'centre accreditation status and audit reports',
            'Grievance System': 'complaint ticketing and resolution workflows',
            'Reports & Analytics': 'custom report builder and PDF export tools'
        };
        document.getElementById('placeholder-title').textContent = title;
        document.getElementById('placeholder-module').textContent = title;
        document.getElementById('placeholder-desc').textContent = descriptions[title] || 'upcoming features';
    }

    // Update Sidebar Active State
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('text-kase-700', 'bg-kase-50');
        link.classList.add('text-gray-600', 'hover:bg-gray-50');

        // Simple logic to highlight active link based on onclick attribute
        if (link.getAttribute('onclick').includes(`'${sectionId}'`)) {
            // Check for specific placeholder title match if needed, but for now simple match
            if (sectionId !== 'placeholder' || link.getAttribute('onclick').includes(`'${title}'`)) {
                link.classList.add('text-kase-700', 'bg-kase-50');
                link.classList.remove('text-gray-600', 'hover:bg-gray-50');
            }
        }
    });

    // Close mobile menu if open (not implemented yet but good practice)
}

// --- Dashboard Logic ---

// --- Charts Global Vars ---
let modeChartInstance = null;
let passFailChartInstance = null;

function updateDashboard() {
    // Update Stats
    document.getElementById('stat-assessments').textContent = state.stats.assessments.toLocaleString();
    document.getElementById('stat-candidates').textContent = state.stats.candidates.toLocaleString();

    // Percentages
    const passPct = Math.round((state.stats.pass / (state.stats.pass + state.stats.fail)) * 100) || 91.12;
    const failPct = 100 - passPct;

    document.getElementById('stat-pass').textContent = passPct + '%';
    document.getElementById('stat-fail').textContent = failPct + '%';

    // Update Mode Breakdown Text
    document.getElementById('val-online').textContent = state.breakdown.online;
    document.getElementById('val-offline').textContent = state.breakdown.offline;
    document.getElementById('val-hybrid').textContent = state.breakdown.hybrid;

    // --- Chart.js Implementations ---

    // 1. Mode Breakdown (Doughnut)
    const modeCtx = document.getElementById('modeChart').getContext('2d');
    if (modeChartInstance) modeChartInstance.destroy();

    modeChartInstance = new Chart(modeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Online', 'Offline', 'Hybrid'],
            datasets: [{
                data: [state.breakdown.online, state.breakdown.offline, state.breakdown.hybrid],
                backgroundColor: ['#3b82f6', '#6366f1', '#14b8a6'], // Blue, Indigo, Teal
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, font: { family: 'Inter', size: 11 } }
                }
            },
            cutout: '70%'
        }
    });

    // 2. Pass/Fail (Pie)
    const passFailCtx = document.getElementById('passFailChart').getContext('2d');
    if (passFailChartInstance) passFailChartInstance.destroy();

    passFailChartInstance = new Chart(passFailCtx, {
        type: 'pie',
        data: {
            labels: ['Pass', 'Fail'],
            datasets: [{
                data: [passPct, failPct],
                backgroundColor: ['#22c55e', '#ef4444'], // Green, Red
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, font: { family: 'Inter', size: 11 } }
                }
            }
        }
    });


    // Update Table
    const tbody = document.getElementById('activity-table-body');
    tbody.innerHTML = ''; // Clear existing

    state.activity.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition-colors";
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${row.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${row.mode === 'Online' ? 'bg-blue-100 text-blue-800' :
                row.mode === 'Offline' ? 'bg-indigo-100 text-indigo-800' : 'bg-teal-100 text-teal-800'}">
                    ${row.mode}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">${row.candidates}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">${row.pass}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">${row.fail}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="text-kase-600 hover:text-kase-900 font-medium text-xs border border-kase-200 px-3 py-1 rounded hover:bg-kase-50 transition">Details</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Form Logic ---

function handleAssessmentSubmit(e) {
    e.preventDefault();

    const date = document.getElementById('form-date').value;
    const mode = document.getElementById('form-mode').value;
    const candidates = parseInt(document.getElementById('form-candidates').value);
    const passed = parseInt(document.getElementById('form-passed').value);
    const failed = Math.max(0, candidates - passed);

    // Validation
    if (passed > candidates) {
        alert('Passed candidates cannot exceed total candidates!');
        return;
    }

    // Update Mock State
    state.stats.assessments += 1;
    state.stats.candidates += candidates;

    state.breakdown[mode.toLowerCase()] += 1;

    // Add to activity (prepend)
    state.activity.unshift({
        date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
        mode: mode,
        candidates: candidates,
        pass: passed,
        fail: failed
    });

    // Refresh Dashboard
    updateDashboard();

    // Reset Form
    e.target.reset();

    // Redirect to Dashboard
    showSection('dashboard');

    // Show success message (simple alert for now)
    // alert('Assessment added successfully!');
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    updateDashboard();

    // Event Listeners
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // Login Logic: Accept any input
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('main-layout').classList.remove('hidden');
        showSection('dashboard');
    });

    document.getElementById('assessment-form').addEventListener('submit', handleAssessmentSubmit);
});



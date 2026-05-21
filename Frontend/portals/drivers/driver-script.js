// 1. LIVE DATE DISPLAY

function updateDate() {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateStr = now.toLocaleDateString('en-US', options);
            const shiftTime = "Shift: 08:00 - 17:00";
            document.getElementById('live-date').innerText = `${dateStr} | ${shiftTime}`;
        }
        updateDate();
        // Refresh date at midnight
        setInterval(updateDate, 60000);


// 2. BUTTON TASK COMPLETED

// --- DASHBOARD CENTRAL ENGINE ---

// 1. Data Initialization (Fetch from storage so progress isn't lost on refresh)
let dailyStats = JSON.parse(localStorage.getItem('dailyStats')) || { ewaste: 0, plastic: 0, glass: 0, metal: 0, paper: 0, total: 0 };
let tasksCompleted = parseInt(localStorage.getItem('tasksCompleted')) || 0;
let driverPoints = parseInt(localStorage.getItem('driverPoints')) || 12450; // Base points

// 2. Modal Controls
function openEntryModal() {
    const modal = document.getElementById('entryModal');
    if (modal) modal.style.display = 'flex';
}

function closeEntryModal() {
    const modal = document.getElementById('entryModal');
    if (modal) {
        modal.style.display = 'none';
        const inputs = document.querySelectorAll('.entry-box input');
        inputs.forEach(input => input.value = 0);
    }
}

// 3. The Core Logic: Update Stats & Sync to Rewards
function updateDailyStats() {
    // Grab weights from modal inputs
    const w = {
        ewaste: parseFloat(document.getElementById('w-ewaste').value) || 0,
        plastic: parseFloat(document.getElementById('w-plastic').value) || 0,
        glass: parseFloat(document.getElementById('w-glass').value) || 0,
        metal: parseFloat(document.getElementById('w-metal').value) || 0,
        paper: parseFloat(document.getElementById('w-paper').value) || 0,
        bulk: parseFloat(document.getElementById('w-bulk').value) || 0
    };

    // Calculate User Points (Stored for later use)
    const userEarned = (w.ewaste * 20) + (w.plastic * 10) + (w.glass * 15) + (w.metal * 10) + (w.paper * 10) + (w.bulk * 20);

    if (userEarned === 0) {
        alert("Action Required: Please enter weights to complete the task.");
        return;
    }

    // Driver Point Logic: Base (10) + Milestone Bonuses
    tasksCompleted++;
    let driverEarned = 10; 
    if (tasksCompleted === 5) driverEarned += 10;
    if (tasksCompleted === 10) driverEarned += 20;

    // Update Global Totals
    dailyStats.ewaste += w.ewaste;
    dailyStats.plastic += w.plastic;
    dailyStats.glass += w.glass;
    dailyStats.metal += w.metal;
    dailyStats.paper += w.paper;
    dailyStats.total += Object.values(w).reduce((a, b) => a + b, 0);
    driverPoints += driverEarned;

    // --- PERSISTENCE: Save to LocalStorage ---
    localStorage.setItem('dailyStats', JSON.stringify(dailyStats));
    localStorage.setItem('tasksCompleted', tasksCompleted);
    localStorage.setItem('driverPoints', driverPoints);

    // Update Dashboard UI
    refreshDashboardUI();

    alert(`Task Success!\nUser Earned: ${userEarned} Pts\nDriver Earned: ${driverEarned} Pts\nRewards Hub Synchronized.`);
    closeEntryModal();
}

// 4. Function to Update UI Elements on Dashboard
function refreshDashboardUI() {
    const categories = ['ewaste', 'plastic', 'glass', 'metal', 'paper'];
    const maxTarget = 200; 

    categories.forEach(cat => {
        const label = document.getElementById(`label-${cat}`);
        const bar = document.getElementById(`bar-${cat}`);
        if(label) label.innerText = dailyStats[cat].toFixed(1) + " kg";
        if(bar) {
            let percent = Math.min((dailyStats[cat] / maxTarget) * 100, 100);
            bar.style.width = percent + "%";
        }
    });

    const totalKgEl = document.getElementById('daily-total-kg');
    const pointsEl = document.getElementById('driver-points');
    
    if(totalKgEl) totalKgEl.innerText = dailyStats.total.toFixed(1) + " kg";
    if(pointsEl) pointsEl.innerText = driverPoints + " Pts";
}

// 5. Initialize on Load
window.onload = function() {
    refreshDashboardUI(); // Load saved progress immediately
    
    const dateEl = document.getElementById('live-date');
    if(dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.innerText = new Date().toLocaleDateString('en-US', options) + " | Shift: 08:00 - 17:00";
    }
};

// 3. LINKS ON LEFT NAVBAR

document.querySelectorAll('.nav-menu li').forEach(item => {
    item.addEventListener('click', function() {
        // 1. Remove 'active' class from all menu items
        document.querySelectorAll('.nav-menu li').forEach(li => li.classList.remove('active'));
        
        // 2. Add 'active' class to the clicked item
        this.classList.add('active');
    });
});

// 4. REWARDS PAGE - REDEEM CARDS

 function redeem(btn) {
        const card = btn.closest('.coupon-card');
        const cost = parseInt(card.getAttribute('data-cost'));
        const pointsElement = document.getElementById('total-points');
        let currentPoints = parseInt(pointsElement.innerText.replace(/,/g, ''));

        if (currentPoints >= cost) {
            currentPoints -= cost;
            pointsElement.innerText = currentPoints.toLocaleString();
            
            // UI Feedback
            btn.innerText = "CLAIMED";
            btn.style.background = "#94a3b8";
            btn.disabled = true;
            card.style.opacity = "0.6";
            alert("Redemption Successful! Check your SMS for the voucher code.");
        } else {
            alert("Insufficient Eco-Points for this redemption.");
        }
    }

    // 5. REWARDS PAGE - UPDATE OF POINTS

 // --- REWARDS HUB SYNC ---

document.addEventListener('DOMContentLoaded', function() {
    // Target the specific point display ID we made for the Rewards Hub
    const pointsDisplay = document.getElementById('total-points');
    
    if (pointsDisplay) {
        // Fetch points from the shared 'driverPoints' key
        const currentBalance = localStorage.getItem('driverPoints') || 12450;
        
        // Update UI with formatted number (e.g., 12,450)
        pointsDisplay.innerText = parseInt(currentBalance).toLocaleString();
    }
});



// 6. REDEEM BUTTON 

function redeem(btn) {
    const card = btn.closest('.coupon-card');
    const cost = parseInt(card.getAttribute('data-cost'));
    
    // Get latest points starting from 110
    let currentBalance = parseInt(localStorage.getItem('driverPoints')) || 110;

    if (currentBalance >= cost) {
        // 1. Deduct points
        currentBalance -= cost;
        localStorage.setItem('driverPoints', currentBalance);
        
        // 2. Update the Top Wallet Display
        const pointsDisplay = document.getElementById('total-points');
        if (pointsDisplay) {
            pointsDisplay.innerText = currentBalance.toLocaleString();
        }
        
        // 3. SUCCESS STATE: Change to Blue background with White text
        btn.innerText = "COUPON CLAIMED";
        btn.style.background = "#07285d"; // Midnight Blue
        btn.style.color = "#ffffff";     // Pure White
        
        // Optional: Keep it slightly interactive so they know it worked
        alert("Success! Your coupon has been issued and points deducted.");

    } else {
        alert("Insufficient Balance. Keep recycling to earn more points!");
    }
}

// 7. REPORT PAGE 

document.getElementById('issueForm').addEventListener('submit', function(e) {
            e.preventDefault();

            // 1. Capture Data
            const newReport = {
                id: "TKT-" + Math.floor(1000 + Math.random() * 9000),
                driver: "Rayan Ahmed", // Usually pulled from user session
                category: document.getElementById('issueCategory').value,
                priority: document.querySelector('input[name="priority"]:checked').value,
                description: document.getElementById('issueDesc').value,
                timestamp: new Date().toLocaleString(),
                status: "Pending"
            };

            // 2. Get existing reports or start new array
            let reports = JSON.parse(localStorage.getItem('adminReports')) || [];
            
            // 3. Add new report to list
            reports.unshift(newReport); // Adds to the beginning of the list
            
            // 4. Save back to localStorage
            localStorage.setItem('adminReports', JSON.stringify(reports));

            // 5. Success UI
            alert("Report submitted successfully! Ticket ID: " + newReport.id);
            this.reset();
        });
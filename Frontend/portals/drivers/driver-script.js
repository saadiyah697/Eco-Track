/* =========================================
   GLOBAL LOADER FADE-OUT
========================================= */
window.addEventListener('load', function() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.classList.add('hidden');
});

/* =========================================
   SPA ROUTING & MOBILE MENU
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.view-section');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    // Update Live Date on Title Bar
    function updateDate() {
        const now = new Date();
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        const dateEl = document.getElementById('live-date');
        if (dateEl) dateEl.innerText = now.toLocaleDateString('en-US', options) + " | Shift: 08:00 - 17:00";
    }
    updateDate();
    setInterval(updateDate, 60000);

    // Mobile Hamburger
    if (mobileBtn && sidebar) {
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            mobileBtn.classList.toggle('open');
        });
    }

    // SPA Link Router
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');

            sections.forEach(sec => sec.classList.remove('active'));

            const targetId = e.currentTarget.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');

            // Update Header Title
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) pageTitle.innerText = e.currentTarget.innerText;

            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('open');
                if (mobileBtn) mobileBtn.classList.remove('open');
            }
        });
    });

    // Report Form
    const issueForm = document.getElementById('issueForm');
    if (issueForm) {
        issueForm.addEventListener('submit', function(e) {
            e.preventDefault();
            Swal.fire({
                icon: 'success',
                title: 'Report Transmitted',
                text: 'Dispatch has received your incident report.',
                confirmButtonColor: '#13428e'
            });
            this.reset();
        });
    }
});

/* =========================================
   DRIVER REWARD LOGIC & MODAL
========================================= */

// Dashboard Variables
let tasksCompleted = 14;
let driverPoints = 12450;

function openEntryModal() {
    const modal = document.getElementById('entryModal');
    if (modal) modal.style.display = 'flex';
}

function closeEntryModal() {
    const modal = document.getElementById('entryModal');
    if (modal) modal.style.display = 'none';
}

// 💥 THE CONFIRM AND PROCESS ENGINE 💥
function processCollection() {
    closeEntryModal();

    // 1. Trigger the Premium Completion Alert
    Swal.fire({
        icon: 'success',
        title: 'Task Completed!',
        html: `
            <p>Verification successful. User points have been credited.</p>
            <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
            <p style="color:#10b981; font-weight:700; font-size:1.1rem;">+5 Green Points Awarded to you!</p>
        `,
        confirmButtonColor: '#13428e',
        confirmButtonText: 'Continue Shift',
        backdrop: `rgba(5, 47, 88, 0.7)` // Dark blue cinematic backdrop
    }).then(() => {
        // 2. Update Driver Stats UI
        tasksCompleted += 1;
        driverPoints += 5;
        
        document.getElementById('total-tasks').innerText = tasksCompleted;
        
        const ptDisplay = document.getElementById('driver-points-display');
        const rwDisplay = document.getElementById('reward-points-display');
        
        if (ptDisplay) ptDisplay.innerHTML = `${driverPoints.toLocaleString()} <span class="unit">PTS</span>`;
        if (rwDisplay) rwDisplay.innerHTML = `${driverPoints.toLocaleString()} <span>PTS</span>`;
        
        // Optional: Reset modal inputs
        document.querySelectorAll('.category-grid input').forEach(input => input.value = 0);
    });
}

// Coupon Redemption
function redeemDriverPoints(button) {
    const card = button.parentElement;
    const costText = card.querySelector('.cost').getAttribute('data-cost');
    const cost = parseInt(costText);

    if (driverPoints >= cost) {
        driverPoints -= cost;
        
        // Update UI
        const ptDisplay = document.getElementById('driver-points-display');
        const rwDisplay = document.getElementById('reward-points-display');
        if (ptDisplay) ptDisplay.innerHTML = `${driverPoints.toLocaleString()} <span class="unit">PTS</span>`;
        if (rwDisplay) rwDisplay.innerHTML = `${driverPoints.toLocaleString()} <span>PTS</span>`;

        Swal.fire({
            icon: 'success',
            title: 'Voucher Secured',
            text: 'Check your encrypted email for the digital barcode.',
            confirmButtonColor: '#13428e'
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Insufficient Points',
            text: 'Complete more pickups to afford this voucher.',
            confirmButtonColor: '#ef4444'
        });
    }
}
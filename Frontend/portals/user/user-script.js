/* =========================================
   GLOBAL LOADER FADE-OUT LOGIC
========================================= */
window.addEventListener('load', function() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.classList.add('hidden');
    }
});

/* =========================================
   USER SPA ROUTING, MOBILE MENU & NOTIFS
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.side-links a');
    const sections = document.querySelectorAll('.view-section');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    // 1. Mobile Menu Toggle
    if (mobileBtn && sidebar) {
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            mobileBtn.classList.toggle('open');
        });
    }

    // 2. Notification Dropdown Logic
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');

    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
                notifDropdown.classList.remove('show');
            }
        });
    }

    // 3. SPA Navigation Logic
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active states from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active state to clicked link
            e.currentTarget.classList.add('active');

            // Hide all sections
            sections.forEach(sec => {
                sec.classList.remove('active');
            });

            // Show target section
            const targetId = e.currentTarget.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Trigger Map Resize if tracking tab is opened (fixes hidden map bug)
            if (targetId === 'view-livetracking' && typeof google !== 'undefined') {
                setTimeout(() => {
                    if (map) {
                        google.maps.event.trigger(map, 'resize');
                        map.setCenter({ lat: 25.2048, lng: 55.2708 });
                    }
                }, 100);
            }

            // Close mobile menu if open
            if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('open');
                if (mobileBtn) mobileBtn.classList.remove('open');
            }
        });
    });

    // 4. Handle Pickup Form Submissions (Premium Alert)
    const pickupForm = document.getElementById('pickupForm');
    if (pickupForm) {
        pickupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            Swal.fire({
                icon: 'success',
                title: 'Driver Pinged!',
                text: 'Your pickup request has been routed to the nearest available driver. Head to Live Tracking to monitor their arrival.',
                confirmButtonColor: '#04886d',
                confirmButtonText: 'Track Pickup',
                showCancelButton: true,
                cancelButtonText: 'Close',
                cancelButtonColor: '#718096',
                backdrop: `rgba(34, 60, 86, 0.6)`
            }).then((result) => {
                if (result.isConfirmed) {
                    // Automatically route the user to the Live Tracking view
                    document.querySelector('[data-target="view-livetracking"]').click();
                    
                    // Simulate an active request turning on in the UI
                    document.getElementById('no-request-view').style.display = 'none';
                    document.getElementById('active-tracking-view').style.display = 'block';
                }
            });

            pickupForm.reset();
        });
    }
});


/* =========================================
   REWARDS LOGIC
========================================= */
function redeemPoints(button) {
    const balanceElement = document.getElementById('user-points');
    const dashBalanceElement = document.getElementById('dashboard-points-display');
    let currentBalance = parseInt(balanceElement.innerText);

    const card = button.parentElement;
    const costElement = card.querySelector('.cost-tag');
    const voucherCost = parseInt(costElement.getAttribute('data-cost'));
    const voucherName = card.querySelector('h6').innerText;

    if (currentBalance >= voucherCost) {
        const newBalance = currentBalance - voucherCost;
        balanceElement.innerText = newBalance + " PTS";
        dashBalanceElement.innerHTML = `${newBalance} <span class="pts">PTS</span>`;

        showSuccess(button, voucherName);
    } else {
        showError(button);
    }
}

function showSuccess(button, name) {
    const originalText = button.innerText;
    button.innerText = "Redeemed!";
    button.style.backgroundColor = "#a4de02"; 
    button.style.color = "#223c56";
    button.disabled = true;

    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Your ${name} voucher has been sent to your email.`,
        confirmButtonColor: '#04886d'
    });

    setTimeout(() => {
        button.innerText = originalText;
        button.style.backgroundColor = ""; 
        button.style.color = "";
        button.disabled = false;
    }, 3000);
}

function showError(button) {
    const originalText = button.innerText;
    button.innerText = "Insufficient Points";
    button.style.backgroundColor = "#e74c3c"; 
    
    setTimeout(() => {
        button.innerText = originalText;
        button.style.backgroundColor = "";
    }, 2000);
}


/* =========================================
   LIVE TRACKING LOGIC (GOOGLE MAPS)
========================================= */
let map;
let driverMarker;

function initMap() {
    const userLocation = { lat: 25.2048, lng: 55.2708 }; 
    const driverStartLocation = { lat: 25.2150, lng: 55.2850 };
    const mapElement = document.getElementById("map");
    
    if (!mapElement) return;

    map = new google.maps.Map(mapElement, {
        zoom: 14,
        center: userLocation,
        disableDefaultUI: true, 
        styles: [
            { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
            { "featureType": "transit", "stylers": [{ "visibility": "off" }] }
        ]
    });

    new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location",
        label: "U"
    });

    driverMarker = new google.maps.Marker({
        position: driverStartLocation,
        map: map,
        icon: {
            url: "https://cdn-icons-png.flaticon.com/512/1048/1048329.png",
            scaledSize: new google.maps.Size(45, 45)
        }
    });

    simulateMovement();
}

function simulateMovement() {
    setInterval(() => {
        if (!driverMarker) return;
        const currentPos = driverMarker.getPosition();
        const newLat = currentPos.lat() - 0.0001;
        const newLng = currentPos.lng() - 0.0001;
        
        const newPos = new google.maps.LatLng(newLat, newLng);
        driverMarker.setPosition(newPos);
    }, 3000);
}

window.initMap = initMap;
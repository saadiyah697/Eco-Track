/* =========================================
   ECO-TRACK: ADMIN COMMAND CENTER (BULLETPROOF)
========================================= */

// Define map variables globally
let adminMap;
let fleetMarkers = [];

// =========================================
// 1. INITIALIZATION & ROUTING
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Hide Loader
    const loader = document.getElementById('global-loader');
    if (loader) {
        setTimeout(() => { loader.style.opacity = '0'; loader.style.visibility = 'hidden'; }, 500);
    }

    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.view-section');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    // Title Descriptions
    const titleDescriptions = {
        'Platform Overview': 'Real-time system diagnostics and network health.',
        'Live Logistics': 'GPS Tracking and fleet operational status.',
        'Users Ecosystem': 'Manage registered users, balances, and access.',
        'Fleet Operators': 'Driver deployment and efficiency metrics.',
        'Points Economy': 'Control system reward rates and analyze liabilities.',
        'Incident Reports': 'Resolve network errors and physical bin damages.'
    };

    // Mobile Menu Toggle
    if (mobileBtn && sidebar) {
        mobileBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // SPA Router
    if (navLinks.length > 0 && sections.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 1. Update active states on sidebar
                navLinks.forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // 2. Hide all sections, show target
                sections.forEach(sec => sec.classList.remove('active'));
                const targetId = e.currentTarget.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.classList.add('active');
                }

                // 3. Update Header Texts
                const rawTitle = e.currentTarget.innerText.trim();
                const cleanTitle = rawTitle.replace(/[0-9]+$/, '').trim(); // Removes badge numbers
                
                if (pageTitle) pageTitle.innerText = cleanTitle;
                if (pageSubtitle && titleDescriptions[cleanTitle]) {
                    pageSubtitle.innerText = titleDescriptions[cleanTitle];
                }

                // 4. Trigger Map Resize (Fixes the grey box bug)
                if (targetId === 'view-logistics') {
                    setTimeout(() => {
                        if (typeof google !== 'undefined' && adminMap) {
                            google.maps.event.trigger(adminMap, 'resize');
                            adminMap.setCenter({ lat: 25.2048, lng: 55.2708 }); 
                        }
                    }, 200);
                }

                // 5. Close mobile menu
                if (window.innerWidth <= 768 && sidebar) {
                    sidebar.classList.remove('open');
                }
            });
        });
    }

    // =========================================
    // 2. FUNCTIONAL JS: TABLE SEARCH & FILTER
    // =========================================
    const searchInput = document.getElementById('userSearch');
    const statusFilter = document.getElementById('statusFilter');
    const userRows = document.querySelectorAll('.user-row');

    function filterTable() {
        if (!searchInput || !statusFilter) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = statusFilter.value;

        userRows.forEach(row => {
            const userNameEl = row.querySelector('.user-name');
            const userEmailEl = row.querySelector('span');
            
            const userName = userNameEl ? userNameEl.innerText.toLowerCase() : '';
            const userEmail = userEmailEl ? userEmailEl.innerText.toLowerCase() : '';
            const rowStatus = row.getAttribute('data-status');
            
            const matchesSearch = userName.includes(searchTerm) || userEmail.includes(searchTerm);
            const matchesFilter = filterValue === 'all' || rowStatus === filterValue;

            if (matchesSearch && matchesFilter) {
                row.style.display = ''; 
            } else {
                row.style.display = 'none'; 
            }
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterTable);
    if (statusFilter) statusFilter.addEventListener('change', filterTable);

    // =========================================
    // 3. FUNCTIONAL JS: ECONOMY FORM
    // =========================================
    const ecoForm = document.getElementById('ecoForm');
    if (ecoForm) {
        ecoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Rates Updated Successfully',
                    text: 'The new reward conversion rates are now live across the network.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
            } else {
                alert("Rates Updated Successfully!");
            }
        });
    }
});

// =========================================
// 4. BACKEND MOCK ACTIONS (SweetAlert2)
// =========================================

window.suspendUser = function(btn, userName) {
    if (typeof Swal === 'undefined') return alert(`Suspended ${userName}`);
    
    Swal.fire({
        title: `Suspend ${userName}?`,
        text: "This user will lose access to the Eco-Track app immediately.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Yes, suspend account'
    }).then((result) => {
        if (result.isConfirmed) {
            const row = btn.closest('tr');
            if (row) {
                row.classList.add('banned-row');
                row.setAttribute('data-status', 'Suspended');
                const statusPill = row.querySelector('.status-pill');
                if (statusPill) {
                    statusPill.className = 'status-pill error';
                    statusPill.innerText = 'Suspended';
                }
                const td = btn.closest('td');
                if (td) {
                    td.innerHTML = `<button class="action-btn revive" onclick="activateUser(this, '${userName}')"><i class="ph ph-check-circle"></i></button>`;
                }
            }
            Swal.fire('Suspended!', `${userName}'s account has been frozen.`, 'success');
        }
    });
};

window.activateUser = function(btn, userName) {
    if (typeof Swal === 'undefined') return alert(`Reactivated ${userName}`);

    Swal.fire({
        title: `Reactivate ${userName}?`,
        text: "This will restore their points balance and app access.",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Restore Access'
    }).then((result) => {
        if (result.isConfirmed) {
            const row = btn.closest('tr');
            if (row) {
                row.classList.remove('banned-row');
                row.setAttribute('data-status', 'Active');
                const statusPill = row.querySelector('.status-pill');
                if (statusPill) {
                    statusPill.className = 'status-pill success';
                    statusPill.innerText = 'Active';
                }
                const td = btn.closest('td');
                if (td) {
                    td.innerHTML = `<button class="action-btn" onclick="suspendUser(this, '${userName}')"><i class="ph ph-prohibit"></i></button>`;
                }
            }
            Swal.fire('Restored', `${userName} is back online.`, 'success');
        }
    });
};

window.resolveIncident = function(buttonElement) {
    if (typeof Swal === 'undefined') return alert('Incident Resolved');

    Swal.fire({
        title: 'Action Logged',
        text: 'Action has been recorded and ticket marked as IN-PROGRESS.',
        icon: 'success',
        confirmButtonColor: '#1e293b'
    }).then(() => {
        const card = buttonElement.closest('.report-card');
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => card.remove(), 300);
        }
    });
};

window.dismissIncident = function(buttonElement) {
    const card = buttonElement.closest('.report-card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => card.remove(), 300);
    }
};

window.addDriver = function() {
    if (typeof Swal === 'undefined') return alert('Add Driver Triggered');

    Swal.fire({
        title: 'Generate Driver Token',
        text: 'An onboarding link will be sent to the new operator.',
        input: 'email',
        inputPlaceholder: 'Enter driver email address...',
        showCancelButton: true,
        confirmButtonText: 'Send Invite',
        confirmButtonColor: '#1e293b'
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            Swal.fire('Invite Sent!', '', 'success');
        }
    });
};

// =========================================
// 5. GOOGLE MAPS ENGINE
// =========================================
window.initAdminMap = function() {
    const mapElement = document.getElementById("admin-map");
    if (!mapElement || typeof google === 'undefined') return;

    // Remove the mock UI
    const mockUI = mapElement.querySelector('.mock-map-ui');
    if (mockUI) mockUI.remove();

    const uaeCenter = { lat: 25.2048, lng: 55.2708 };

    adminMap = new google.maps.Map(mapElement, {
        zoom: 11,
        center: uaeCenter,
        disableDefaultUI: false,
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
            { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
            { "featureType": "transit", "stylers": [{ "visibility": "off" }] }
        ]
    });

    const truckIcon = {
        url: "https://cdn-icons-png.flaticon.com/512/1048/1048329.png",
        scaledSize: new google.maps.Size(40, 40)
    };

    const driver1 = new google.maps.Marker({
        position: { lat: 25.3175, lng: 55.3850 },
        map: adminMap,
        title: "Rayan Ahmed (FLT-842)",
        icon: truckIcon
    });

    const driver2 = new google.maps.Marker({
        position: { lat: 25.0805, lng: 55.1403 },
        map: adminMap,
        title: "Kareem Hassan (FLT-119)",
        icon: truckIcon
    });

    fleetMarkers.push(driver1, driver2);
    
    // Animate Trucks
    setInterval(() => {
        if (fleetMarkers.length > 0) {
            const pos1 = fleetMarkers[0].getPosition();
            fleetMarkers[0].setPosition(new google.maps.LatLng(pos1.lat() - 0.0001, pos1.lng() - 0.0001));
            
            const pos2 = fleetMarkers[1].getPosition();
            fleetMarkers[1].setPosition(new google.maps.LatLng(pos2.lat() + 0.0001, pos2.lng() + 0.0002));
        }
    }, 2500);
};

/* =========================================
   USER ECOSYSTEM LOGIC
========================================= */

// 1. Fetch and render users
async function fetchAllUsers() {
    try {
        const token = localStorage.getItem('ecoTrackToken');
        
        // Adjust this URL to match your actual backend API route
        const response = await fetch('http://localhost:5000/api/users', { 
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch users');
        
        const users = await response.json();
        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = ''; // Clear the "Loading..." text

        users.forEach(user => {
            // Optional: Skip admin users so they don't show up in the regular user table
            if(user.role === 'admin') return;

            // Generate demo points (Random number rounded to nearest 10, up to 1500)
            const demoPoints = Math.floor(Math.random() * 150) * 10;
            
            // Determine status (Assuming your DB saves a 'status' field. Default to Active)
            const status = user.status || 'Active';
            const isSuspended = status === 'Suspended';
            
            // Set up classes and styling based on status
            const rowClass = isSuspended ? 'user-row banned-row' : 'user-row';
            const avatarInitial = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
            const avatarColor = isSuspended ? 'bg-red' : 'bg-dark'; 
            
            const statusPill = isSuspended 
                ? '<span class="status-pill error">Suspended</span>' 
                : '<span class="status-pill success">Active</span>';

            const actionButton = isSuspended
                ? `<button class="action-btn revive" onclick="toggleUserStatus('${user._id}', 'Active', '${user.fullName}')"><i class="ph ph-check-circle"></i></button>`
                : `<button class="action-btn" onclick="toggleUserStatus('${user._id}', 'Suspended', '${user.fullName}')"><i class="ph ph-prohibit"></i></button>`;

            // Create and inject the row
            const tr = document.createElement('tr');
            tr.className = rowClass;
            tr.setAttribute('data-status', status);
            
            tr.innerHTML = `
                <td>
                    <div class="tb-user">
                        <div class="tb-avatar ${avatarColor}">${avatarInitial}</div>
                        <div><strong class="user-name">${user.fullName}</strong><br><span>${user.email}</span></div>
                    </div>
                </td>
                <td>${user.city || 'UAE'}</td>
                <td><strong>${demoPoints} PTS</strong></td>
                <td>${statusPill}</td>
                <td>${actionButton}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        document.getElementById('userTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error loading users.</td></tr>';
    }
}

// 2. Handle Suspend/Activate Actions
async function toggleUserStatus(userId, newStatus, userName) {
    try {
        const token = localStorage.getItem('ecoTrackToken');
        
        // Adjust this URL to match your backend route for updating a user
        const response = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
            method: 'PATCH', // Or PUT, depending on your backend
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Status Updated',
                text: `${userName} is now ${newStatus}.`,
                confirmButtonColor: '#04886d'
            });
            fetchAllUsers(); // Instantly refresh the table to show the new status
        } else {
            Swal.fire('Error', 'Failed to update user status.', 'error');
        }
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

// 3. Load the data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchAllUsers();
    fetchAllDrivers(); 
});

/* =========================================
   FLEET OPERATORS LOGIC
========================================= */

async function fetchAllDrivers() {
    try {
        const token = localStorage.getItem('ecoTrackToken');
        
        // We use the exact same backend route!
        const response = await fetch('http://localhost:5000/api/users', { 
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch drivers');
        
        const allUsers = await response.json();
        const tbody = document.getElementById('driverTableBody');
        
        if (!tbody) return; // Safety check in case the tab isn't loaded
        tbody.innerHTML = ''; 

        // FILTER: Keep ONLY the users who registered as 'driver'
        const drivers = allUsers.filter(user => user.role === 'driver');

        // If no drivers exist yet
        if (drivers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #718096;">No drivers onboarded yet.</td></tr>';
            return;
        }

        drivers.forEach(driver => {
            // Generate demo UI data for the columns we don't track in the DB yet
            const vehicles = ['EV Transporter (DXB-A 84729)', 'Heavy Truck (SHJ-3 112)', 'Light Pickup (AJM-B 4421)'];
            const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
            const randomRating = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1); 
            
            // Check if they provided a driver ID during registration, otherwise show pending
            const displayId = driver.driverId ? driver.driverId : 'FLT-PENDING';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="display: block; color: #14293e; font-size: 15px; margin-bottom: 3px;">${driver.fullName}</strong>
                    <span style="color: #718096; font-size: 13px;">${displayId}</span>
                </td>
                <td style="color: #4a5568; font-size: 14px;">${randomVehicle}</td>
                <td>
                    <span style="color: #04886d; font-weight: 600; font-size: 13px;">
                        <i class="fa-solid fa-circle" style="font-size: 8px; margin-right: 5px;"></i> Online (Active)
                    </span>
                </td>
                <td style="color: #4a5568; font-size: 14px;">
                    <i class="fa-solid fa-star" style="color: #f39c12;"></i> ${randomRating} / 5.0
                </td>
                <td>
                    <button style="padding: 6px 15px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer; font-size: 13px; font-weight: 600; color: #4a5568; transition: 0.3s;" onmouseover="this.style.borderColor='#04886d'; this.style.color='#04886d'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#4a5568'">
                        View Details
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error fetching drivers:", error);
        document.getElementById('driverTableBody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error loading fleet data.</td></tr>';
    }
}
/* =========================================
   ECO-TRACK: SESSION & PROFILE MANAGER
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Grab the user data from local storage
    const userDataString = localStorage.getItem('ecoTrackUser');
    const token = localStorage.getItem('ecoTrackToken');

    // 2. Security Check: If no data exists, kick them back to login!
    if (!userDataString || !token) {
        window.location.href = '../login.html'; // Adjust path if needed
        return;
    }

    // Parse the JSON string back into a JavaScript object
    const user = JSON.parse(userDataString);

    // =========================================
    // DRIVER DASHBOARD UPDATES
    // =========================================
    if (window.location.href.includes('driver')) {
        const headerName = document.getElementById('driver-header-name');
        const headerId = document.getElementById('driver-header-id');
        const profileName = document.getElementById('driver-profile-name');
        
        // Target BOTH avatar circles
        const headerInitials = document.getElementById('driver-avatar-initials');
        const profileInitials = document.getElementById('driver-profile-initials');

        // 1. Update Names
        if (headerName) headerName.textContent = user.fullName;
        if (profileName) profileName.textContent = user.fullName;

        // 2. Update Driver ID (Check if it exists, otherwise Pending)
        if (headerId) {
            headerId.textContent = user.driverId ? `ID: ${user.driverId}` : 'ID: PENDING';
        }

        // 3. Generate and push Initials to BOTH circles
        if (user.fullName) {
            const nameParts = user.fullName.split(' ');
            let initials = nameParts[0][0]; 
            if (nameParts.length > 1) {
                initials += nameParts[nameParts.length - 1][0]; 
            }
            
            const finalInitials = initials.toUpperCase();
            if (headerInitials) headerInitials.textContent = finalInitials;
            if (profileInitials) profileInitials.textContent = finalInitials;
        }
    }

    // =========================================
    // USER DASHBOARD / SETTINGS UPDATES
    // =========================================
    if (window.location.href.includes('user')) {
        const fNameInput = document.getElementById('profile-first-name');
        const lNameInput = document.getElementById('profile-last-name');
        const emailInput = document.getElementById('profile-email');

        if (fNameInput || lNameInput) {
            // Split the full name into First and Last name
            const nameParts = user.fullName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || ''; // Grabs the rest of the name

            if (fNameInput) fNameInput.value = firstName;
            if (lNameInput) lNameInput.value = lastName;
        }

        if (emailInput) {
            emailInput.value = user.email;
        }
    }
});

// Logout Function (You can attach this to your Logout buttons)
function logoutUser() {
    localStorage.removeItem('ecoTrackUser');
    localStorage.removeItem('ecoTrackToken');
    window.location.href = '../login.html'; // Send back to login
}
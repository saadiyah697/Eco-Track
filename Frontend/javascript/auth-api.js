/* =========================================
   ECO-TRACK: UNIFIED AUTHENTICATION API
========================================= */

const API_URL = 'http://localhost:5000/api/auth';

document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Determine Role based on URL
    let currentRole = window.location.href.includes('driver') ? 'driver' : 'user';

    // =========================================
    // LOGIN LOGIC
    // =========================================
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
            submitBtn.disabled = true;

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('ecoTrackToken', data.token);
                    localStorage.setItem('ecoTrackUser', JSON.stringify(data.user));

                    Swal.fire({
                        icon: 'success',
                        title: 'Access Granted',
                        text: `Welcome back, ${data.user.fullName}!`,
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        // ROUTING ENGINE
                        if (data.user.role === 'admin') {
                            window.location.href = '../portals/admin/admin-dashboard.html';
                        } else if (data.user.role === 'driver') {
                            window.location.href = '../portals/drivers/driver-dashboard.html';
                        } else {
                            window.location.href = '../portals/user/user-dashboard.html';
                        }
                    });

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Authentication Failed',
                        text: data.message || 'Invalid credentials. Please try again.',
                        confirmButtonColor: '#223c56'
                    });
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }

            } catch (error) {
                console.error("Login Error:", error);
                Swal.fire('Server Error', 'Unable to connect to the Eco-Track servers.', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // =========================================
    // REGISTRATION LOGIC
    // =========================================
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';
            submitBtn.disabled = true;

            const fullName = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            
            // 🔥 CRITICAL FIX: Grab Driver ID safely
            const driverIdInput = document.getElementById('reg-driver-id');
            const driverId = driverIdInput ? driverIdInput.value : undefined;

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        fullName, 
                        email, 
                        password, 
                        role: currentRole,
                        driverId: driverId // Will send the ID if it exists
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Account Created!',
                        text: 'Your Eco-Track account has been successfully registered. Please log in.',
                        confirmButtonColor: '#1abc9c'
                    }).then(() => {
                        registerForm.reset();
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        
                        // Switch back to Login view visually
                        document.body.classList.remove('active-signup');
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Registration Failed',
                        text: data.message || 'Error creating account.',
                        confirmButtonColor: '#223c56'
                    });
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }

            } catch (error) {
                console.error("Registration Error:", error);
                Swal.fire('Server Error', 'Unable to reach the server.', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // =========================================
    // GOOGLE LOGIN LOGIC
    // =========================================
    window.handleGoogleResponse = async (response) => {
        try {
            const res = await fetch(`${API_URL}/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    token: response.credential,
                    role: currentRole // Tells the backend if this is a driver or user registering
                })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('ecoTrackToken', data.token);
                localStorage.setItem('ecoTrackUser', JSON.stringify(data.user));

                Swal.fire({
                    icon: 'success',
                    title: 'Google Auth Successful',
                    text: `Welcome, ${data.user.fullName}!`,
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    // ROUTING ENGINE
                    if (data.user.role === 'admin') {
                        window.location.href = '../portals/admin/admin-dashboard.html';
                    } else if (data.user.role === 'driver') {
                        window.location.href = '../portals/drivers/driver-dashboard.html';
                    } else {
                        window.location.href = '../portals/user/user-dashboard.html';
                    }
                });
            } else {
                Swal.fire('Error', data.message || 'Google Auth Failed', 'error');
            }
        } catch (error) {
            console.error("Google Auth Error:", error);
            Swal.fire('Server Error', 'Unable to reach the server.', 'error');
        }
    };

});
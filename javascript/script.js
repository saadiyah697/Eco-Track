    document.addEventListener("DOMContentLoaded", () => {
        
        // --- 1. LIVE TONS RECYCLED COUNTER ---
        let currentTons = 1200.45;
        const tonsElement = document.getElementById('live-tons');
        
        // Simulates network-wide waste deposits every 3.5 seconds
        setInterval(() => {
            // Generate a random increment between 0.01 and 0.05
            const increment = (Math.random() * 0.04) + 0.01;
            currentTons += increment;
            
            // Format to 2 decimal places with commas
            tonsElement.innerText = currentTons.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });
        }, 3500);


        // --- 2. LIVE COUNTDOWN TIMER ---
        // Initial time: 2 hours, 40 minutes
        let defaultTime = (2 * 3600) + (40 * 60) + 0; 
        let timeInSeconds = defaultTime; 
        let isDriverArrived = false;
        
        const timerElement = document.getElementById('countdown-timer');

        setInterval(() => {
            // If the driver is currently there, stop counting and do nothing
            if (isDriverArrived) return;

            if (timeInSeconds > 0) {
                timeInSeconds--;
                
                // Calculate Hours, Minutes, Seconds
                const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, '0');
                const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2, '0');
                const seconds = String(timeInSeconds % 60).padStart(2, '0');
                
                // Update the DOM
                timerElement.innerText = `${hours}:${minutes}:${seconds}`;
            } else {
                // When time hits 0
                isDriverArrived = true;
                timerElement.innerText = "Driver Arrived!";
                timerElement.classList.add('status-arrived');

                // Wait 5 seconds, then reset the timer to loop again
                setTimeout(() => {
                    timeInSeconds = defaultTime; // Resets back to 2h 40m (or set any new time here)
                    isDriverArrived = false;
                    timerElement.classList.remove('status-arrived');
                }, 5000); 
            }
        }, 1000);

    });

document.addEventListener("DOMContentLoaded", function() {
    const mobileMenu = document.getElementById("mobile-menu");
    const navMenu = document.getElementById("nav-menu-wrapper"); // Updated target

    mobileMenu.addEventListener("click", function() {
        mobileMenu.classList.toggle("is-active");
        navMenu.classList.toggle("active");
    });
});

3. // About Page 
// Function to trigger animations on scroll
const revealOnScroll = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-text').forEach(text => {
        observer.observe(text);
    });
};

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', revealOnScroll);

// 4. community page - waste guide 
const wasteDatabase = {
    // --- PLASTIC ---
    "bottle": { category: "Plastic", status: "Recyclable", symbol: "♻", color: "#1abc9c" },
    "jug": { category: "Plastic", status: "Recyclable", symbol: "♻", color: "#1abc9c" },
    "container": { category: "Plastic", status: "Recyclable (Rinse First)", symbol: "♻", color: "#1abc9c" },
    "plastic bag": { category: "Plastic", status: "Specialized Collection Only", symbol: "⚠️", color: "#f8a02f" },
    "cup": { category: "Plastic", status: "Recyclable", symbol: "♻", color: "#1abc9c" },
    "cutlery": { category: "Plastic", status: "General Waste", symbol: "🗑️", color: "#7f8c8d" },

    // --- PAPER & CARDBOARD ---
    "box": { category: "Paper & Cardboard", status: "Recyclable (Flattened)", symbol: "♻", color: "#a4de02" },
    "newspaper": { category: "Paper & Cardboard", status: "Recyclable", symbol: "♻", color: "#a4de02" },
    "magazine": { category: "Paper & Cardboard", status: "Recyclable", symbol: "♻", color: "#a4de02" },
    "carton": { category: "Paper & Cardboard", status: "Recyclable", symbol: "♻", color: "#a4de02" },
    "envelope": { category: "Paper & Cardboard", status: "Recyclable", symbol: "♻", color: "#a4de02" },
    "paper": { category: "Paper & Cardboard", status: "Recyclable", symbol: "♻", color: "#a4de02" },
    "notebooks": { category: "Paper & Cardboard", status: "Recyclable", symbol: "♻", color: "#a4de02" },

    // --- GLASS ---
    "jar": { category: "Glass", status: "Recyclable", symbol: "♻", color: "#3498db" },
    "glass": { category: "Glass", status: "Recyclable", symbol: "♻", color: "#3498db" },
    "mirror": { category: "Glass", status: "Special Pickup Required", symbol: "⚠️", color: "#f11800" },
    "perfume": { category: "Glass", status: "Recyclable (Remove Cap)", symbol: "♻", color: "#3498db" },

    // --- CANS & TINS ---
    "can": { category: "Cans & Tins", status: "Recyclable", symbol: "♻", color: "#42989b" },
    "tin": { category: "Cans & Tins", status: "Recyclable", symbol: "♻", color: "#42989b" },
    "foil": { category: "Cans & Tins", status: "Recyclable (Clean Only)", symbol: "♻", color: "#42989b" },
    "spray bottle": { category: "Cans & Tins", status: "Hazardous - Special Disposal", symbol: "⚠️", color: "#f11800" },

    // --- E-WASTE ---
    "phone": { category: "E-Waste", status: "Special Pickup Required", symbol: "📱", color: "#054b92" },
    "laptop": { category: "E-Waste", status: "Special Pickup Required", symbol: "💻", color: "#054b92" },
    "battery": { category: "E-Waste", status: "Hazardous - Special Disposal", symbol: "🔋", color: "#ff0000" },
    "tablet": { category: "E-Waste", status: "Special Pickup Required", symbol: "🔌", color: "#054b92" },
    "charger": { category: "E-Waste", status: "Special Pickup Required", symbol: "🔌", color: "#054b92" },
    "bulb": { category: "E-Waste", status: "Special Pickup Required", symbol: "💡", color: "#054b92" }
};

const searchInput = document.getElementById('wasteSearch');
const resultArea = document.getElementById('searchResult');
const searchBtn = document.querySelector('.search-inside-icon'); // Target the magnifying glass

// Function to perform the search
function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === "") {
        resultArea.innerHTML = "";
        return;
    }

    const matchKey = Object.keys(wasteDatabase).find(key => key.includes(query));

    if (matchKey) {
        const item = wasteDatabase[matchKey];
        resultArea.innerHTML = `
            <div class="result-card" style="border-left-color: ${item.color}">
                <div class="icon-square" style="background: ${item.color}">
                    <i class="fas fa-recycle"></i>
                </div>
                <div class="info-content" style="flex-grow: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <span class="res-name">${matchKey}</span>
                            <span style="color:#bdc3c7; margin: 0 10px;">|</span>
                            <span class="res-cat">${item.category}</span>
                        </div>
                        <span style="font-size: 1.5rem; color: ${item.color}">${item.symbol}</span>
                    </div>
                    <div class="res-status">${item.status}</div>
                </div>
            </div>
        `;
    } else {
        resultArea.innerHTML = `
            <div style="padding: 20px; background: #fff5f5; border-radius: 10px; color: #e74c3c; border: 1px solid #ffcccc;">
                <i class="fas fa-exclamation-circle"></i> No items found. Press Enter to search again.
            </div>
        `;
    }
}

// 1. Listen for the "Enter" key press
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// 2. Listen for a click on the magnifying glass icon
searchBtn.addEventListener('click', () => {
    performSearch();
});

// 3. Optional: Clear results if the user deletes everything
searchInput.addEventListener('input', (e) => {
    if (e.target.value === "") {
        resultArea.innerHTML = "";
    }
});



// 5. LOGIN PAGE

function switchAuth(type) {
    const card = document.getElementById('mainCard');
    const title = document.getElementById('dynamicTitle');

    if (type === 'signup') {
        card.classList.add('active-signup');
        title.innerText = "Register";
    } else {
        card.classList.remove('active-signup');
        title.innerText = "User Access Panel";
    }
}

// Form Submission handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Redirect to user portal
            window.location.href = "user-portal.html"; 
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Welcome to the Eco-Track community!");
            switchAuth('login'); // Switch back to login after registration
        });
    }
});

// Social login simulation
function socialAuth(platform) {
    console.log(`Authenticating with ${platform}...`);
    window.location.href = "user-portal.html";
}
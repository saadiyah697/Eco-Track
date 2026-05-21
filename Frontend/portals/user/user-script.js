// Function to handle redemption
function redeemPoints(button) {
    // 1. Get the current balance from the UI
    const balanceElement = document.getElementById('user-points');
    let currentBalance = parseInt(balanceElement.innerText);

    // 2. Find the cost of the specific voucher clicked
    // We look for the sibling element with the class 'cost-tag'
    const card = button.parentElement;
    const costElement = card.querySelector('.cost-tag');
    const voucherCost = parseInt(costElement.getAttribute('data-cost'));
    const voucherName = card.querySelector('h6').innerText;

    // 3. Logic Check: Does the user have enough points?
    if (currentBalance >= voucherCost) {
        // Calculate new balance
        const newBalance = currentBalance - voucherCost;

        // 4. Update the UI
        balanceElement.innerText = newBalance;

        // Visual feedback
        showSuccess(button, voucherName);
        
        // Optional: Trigger a console log for your backend/Node.js testing
        console.log(`Success: Redeemed ${voucherName}. New Balance: ${newBalance}`);
    } else {
        // Handle insufficient points
        showError(button);
    }
}

// Visual feedback functions
function showSuccess(button, name) {
    const originalText = button.innerText;
    button.innerText = "Redeemed!";
    button.style.backgroundColor = "#a4de02"; // Your lime-green highlight
    button.style.color = "#223c56";
    button.disabled = true;

    alert(`Congratulations! Your ${name} voucher has been sent to your email.`);

    // Reset button after 3 seconds if you want to allow multiple purchases
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
    button.style.backgroundColor = "#e74c3c"; // Red for error
    
    setTimeout(() => {
        button.innerText = originalText;
        button.style.backgroundColor = "";
    }, 2000);
}


// live tracking 

// Variable to store the map object
let map;
let driverMarker;

function initMap() {
    console.log("Map Initializing...");

    // 1. Set coordinates (Example: Sharjah/Dubai area)
    const userLocation = { lat: 25.2048, lng: 55.2708 }; 
    const driverStartLocation = { lat: 25.2150, lng: 55.2850 };

    // 2. Initialize the Map
    // Ensure 'map' matches the ID in your HTML <div id="map"></div>
    const mapElement = document.getElementById("map");
    
    if (!mapElement) {
        console.error("Error: Element with ID 'map' not found.");
        return;
    }

    map = new google.maps.Map(mapElement, {
        zoom: 14,
        center: userLocation,
        disableDefaultUI: true, // Hides zoom/street view for a cleaner dashboard look
        styles: [
            // Professional "Silver" Map Theme
            {
                "featureType": "poi",
                "stylers": [{ "visibility": "off" }] // Hide points of interest
            },
            {
                "featureType": "transit",
                "stylers": [{ "visibility": "off" }]
            }
        ]
    });

    // 3. Add User Marker (You)
    new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location",
        label: "U"
    });

    // 4. Add Driver Marker (The Truck)
    driverMarker = new google.maps.Marker({
        position: driverStartLocation,
        map: map,
        icon: {
            // Using a standard high-quality truck icon
            url: "https://cdn-icons-png.flaticon.com/512/1048/1048329.png",
            scaledSize: new google.maps.Size(45, 45)
        }
    });

    // 5. Optional: Simulation of movement
    // In a real app, this data would come from your Firebase/Database
    simulateMovement();
}

// Function to make the truck move slightly every few seconds
function simulateMovement() {
    setInterval(() => {
        const currentPos = driverMarker.getPosition();
        const newLat = currentPos.lat() - 0.0001;
        const newLng = currentPos.lng() - 0.0001;
        
        const newPos = new google.maps.LatLng(newLat, newLng);
        driverMarker.setPosition(newPos);
    }, 3000);
}

// Make sure the function is available globally for the Google Maps Callback
window.initMap = initMap;
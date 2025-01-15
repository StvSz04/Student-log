// Define time variables
let time_text = '00:00:00';
let time = 0; // time in seconds

// Define button
const timer_start_button = document.getElementById("timer_start_button");
const timer_stop_button = document.getElementById("timer_stop_button");

// Set initial time on the label
document.getElementById('timer-label').innerHTML = time_text;

// Function to update the time
function set_time() {
    // Disable the button to prevent multiple clicks
    timer_start_button.disabled = true;

    // Use setInterval to update the time every 1 second (1000ms)
    let interval = setInterval(function() {
        time += 1; // Increment time by 1 second
        
        // Convert seconds to hours, minutes, and seconds
        let hours = Math.floor(time / 3600); // 1 hour = 3600 seconds
        let minutes = Math.floor((time % 3600) / 60); // 1 minute = 60 seconds
        let seconds = time % 60; // Remaining seconds
        
        // Pad numbers with leading zeros if needed
        hours = hours.toString().padStart(2, '0');
        minutes = minutes.toString().padStart(2, '0');
        seconds = seconds.toString().padStart(2, '0');
        
        // Update the time_text and the timer label
        time_text = `${hours}:${minutes}:${seconds}`;
        document.getElementById('timer-label').innerHTML = time_text;

    }, 1000); // Run the function every second
}

// Add event listener to the button to start the timer
timer_start_button.addEventListener("click", set_time);


// Stop timer function

function stop_timer(){

}


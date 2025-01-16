// Define time variables
let time_text = '00:00:00';
let time = 0; // time in seconds

// Define button
const timer_start_button = document.getElementById("timer_start_button");
const timer_stop_button = document.getElementById("timer_stop_button");
const timer_reset_button = document.getElementById("timer_reset_button");
const label = document.getElementById("timer-label");
const submission_button = document.getElementById("submit");



// define interval to add the ease of starting and stopping the interval for the clock within the function
let interval

// Set initial time on the label
document.getElementById('timer-label').innerHTML = time_text;

// Function to update the time
function start_timer() {
    // Disable the button to prevent multiple clicks
    timer_start_button.disabled = true;
    timer_stop_button.disabled = false;


    // Use setInterval to update the time every 1 second (1000ms)
    interval = setInterval(function() {
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
        document.getElementById("labelInput").value = time_text;

    }, 1000); // Run the function every second
}

// Add event listener to the button to start the timer
timer_start_button.addEventListener("click", start_timer);


// Stop timer function

function stop_timer(){

    clearInterval(interval);

    document.getElementById("labelInput").value = time_text;
    timer_stop_button.disabled = true;
    timer_start_button.disabled = false;


}

// Add event listener to the button to stop the timer
timer_stop_button.addEventListener("click", stop_timer);



// Function to reset timer
function reset_timer(){
    //End the current interval,reset time_text, update html
    clearInterval(interval);
    time_text = "00:00:00";
    document.getElementById('timer-label').innerHTML = time_text;
    document.getElementById("labelInput").value = time_text;


}

timer_reset_button.addEventListener("click",reset_timer);

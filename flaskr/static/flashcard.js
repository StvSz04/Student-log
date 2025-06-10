let createbtn = document.getElementById("create");
let usebtn = document.getElementById("use");
let deletebtn = document.getElementById("delete");
// sanbox correpsonds to the div that all 3 buttons will use to diplay info
let sandbox = document.getElementById("sandbox-div") 

// This function creates instances of buttons;
function createButton(id, text,type) {
    const btn = document.createElement("button");
    btn.type = type;
    btn.id = id;
    btn.textContent = text;
    return btn;
}

// This eventListner here correspond to creating a flashcard set
createbtn.addEventListener("click", function () {
    sandbox.innerHTML = '';

    // Initialize set name
    const nameText = document.createElement('p');
    nameText.textContent = prompt("Enter a card set name");
    nameText.name = nameText.textContent;
    if(!nameText.textContent){
        return;
    }
    // Create the hidden input for submission
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'set-name';
    hiddenInput.value = nameText.name;
    
    const hiddenInputTwo = document.createElement('input');
    hiddenInputTwo.type = 'hidden';
    hiddenInputTwo.name = 'card-count';

    // Define basic elements of form
    let cardCount = 0;
    const card = document.createElement("div");
    const flashForm = document.createElement("form");
    flashForm.method = "POST";
    flashForm.action = "/flash_card/flashCreate";
    const frontInput = document.createElement("input");
    frontInput.name = 'front' + cardCount;
    const backInput = document.createElement("input");
    backInput.name = 'back' + cardCount;

    flashForm.appendChild(hiddenInput);
    flashForm.appendChild(hiddenInputTwo);
    flashForm.appendChild(frontInput);
    flashForm.appendChild(backInput);

    const newFlashCardbtn = createButton("new", "New Card", "Button")
    const submitbtn = createButton("submit", "Submit", "Submit");

    flashForm.appendChild(newFlashCardbtn);
    flashForm.appendChild(submitbtn);
    card.appendChild(flashForm);
    sandbox.appendChild(nameText);
    sandbox.appendChild(card);

    newFlashCardbtn.addEventListener("click", function (event) {
        // Grab the last element, used for insertion, - 3 to account for newcard and submit buttons
        let lastInput = flashForm.elements[flashForm.elements.length - 3];

        // Now create the next flashcard input
        cardCount += 1 // Increment
        const newFront = document.createElement("input");
        newFront.name = 'front' + cardCount;
        const newBack = document.createElement("input");
        newBack.name = 'back' + cardCount;

        // Simulate insertAfter
        flashForm.insertBefore(newBack, lastInput.nextSibling);
        flashForm.insertBefore(newFront, lastInput.nextSibling);

    });

    // submitbtn.addEventListener("click", () => alert("Created flashcard set! " + name))
    flashForm.addEventListener('submit', function (event) {
        hiddenInputTwo.value = cardCount + 1;
    });
});



// ALL eventListners here correspond to using a flashcard set
usebtn.addEventListener("click", function(){

    sandbox.innerHTML = ''; // Clear the sanbox


    // Create elements of card
    const card = document.createElement("div");
    const flashForm = document.createElement("form");
    const flashTable = document.createElement("table");
    const choose = createButton("choose","Choose","Button");
    

    // Make a GET request to backend
    async function retrieve() {
        const response = await fetch("/flash_card/flashUse");
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json(); // or response.text() if not JSON
        return data;
    }

    // When user chooses which set make another get request

    // Attach front and "back" inputs to the card, just make and illusion of flipping with replacing innerhtml/text


    // Attach elements to sandbox
    card.appendChild(flashTable);
    flashForm.appendChild(card);
    flashForm.appendChild(choose);
    sandbox.appendChild(flashForm);

    // Add functionality
    retrieve().then(data => {
    console.log(data);  // Should log: {name: "John", age: 30, city: "New York"}
    });

})



// ALL eventListners here correspond to deleting a flashcard set
deletebtn.addEventListener("click", function(){
    sandbox.innerHTML = ''; // Clear the sanbox

})


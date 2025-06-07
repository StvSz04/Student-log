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

    let cardCount = 0;
    let name = prompt("Enter a card set name");
    if (!name) return;

    const card = document.createElement("div");
    const flashForm = document.createElement("form");
    const frontInput = document.createElement("input");
    frontInput.name = 'front ' + ++cardCount;
    const backInput = document.createElement("input");
    backInput.name = 'back ' + ++cardCount;

    flashForm.appendChild(frontInput);
    flashForm.appendChild(backInput);

    const newFlashCardbtn = createButton("new", "New Card", "Button")
    const submitbtn = createButton("submit", "Submit", "Submit");

    flashForm.appendChild(newFlashCardbtn);
    flashForm.appendChild(submitbtn);
    card.appendChild(flashForm);
    sandbox.appendChild(card);

    newFlashCardbtn.addEventListener("click", function (event) {
        // Grab the last element, used for insertion
        let lastInput = flashForm.elements[flashForm.elements.length - 3];

        // Now create the next flashcard input
        const newFront = document.createElement("input");
        newFront.name = 'front ' + ++cardCount;
        const newBack = document.createElement("input");
        newBack.name = 'back ' + ++cardCount;

        // Simulate insertAfter
        flashForm.insertBefore(newBack, lastInput.nextSibling);
        flashForm.insertBefore(newFront, lastInput.nextSibling);

    });

    submitbtn.addEventListener("click", () => alert("Created flashcard set! " + name))

    // flashForm.addEventListener('submit', function (event) {
        // for (const element of flashForm.elements) {
            // console.log(element.name, element.value);
        // }
    // });
});



// ALL eventListners here correspond to using a flashcard set
usebtn.addEventListener("click", function(){

    sandbox.innerHTML = ''; // Clear the sanbox

    // Create elements of card
    const card = document.createElement("div");
    const next = createButton("next", "Next","Button");
    const backbtn = createButton("back", "Back", "Button");
    const flip = createButton("flip", "Flip", "Button");

    // Attach front and "back" inputs to the card, just make and illusion of flipping with replacing innerhtml/text
    let text = "";
    let front = "";
    let back = "";

    // Attach elements to sandbox
    sandbox.appendChild(card);
    sandbox.appendChild(next);
    sandbox.appendChild(flip);
    sandbox.appendChild(backbtn);

    // Add functionality
    next.addEventListener("click", () => alert("Next button works"));
    back.addEventListener("click", () => alert("Back button works"));
    flip.addEventListener("click", () => alert("Flip button works"));

})



// ALL eventListners here correspond to deleting a flashcard set
deletebtn.addEventListener("click", function(){
    sandbox.innerHTML = ''; // Clear the sanbox

})


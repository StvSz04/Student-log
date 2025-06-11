const createbtn = document.getElementById("create");
const usebtn = document.getElementById("use");
const deletebtn = document.getElementById("delete");
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

function createTable(rowAmnt, colAmnt,data) {
    const table = document.createElement("table");

    for (let i = 0; i < rowAmnt; i++) {
        const row = table.insertRow(); // Create row
        const cell = row.insertCell(); // Create cell in row
        checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = data[i].set_name;
        checkbox.value = data[i].set_name; 
        const label = document.createElement("label");
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(data[i].set_name));
        cell.appendChild(label);
    }

    return table;
}

// Make a GET request to backend
async function retrieve(destination,data,string) {
    let response = null;

    if (data){
        const queryString = data.map(id => `${string}=${id}`).join('&');
        response = await fetch(destination + "?" + queryString);
    }
    else{
        response = await fetch(destination);
    }

    if (!response.ok) throw new Error("Fetch failed");
    const answer = await response.json(); // or response.text() if not JSON
    return answer;
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
    card.id = "card";
    const flashForm = document.createElement("form");
    const choose = createButton("choose","Choose","Button");

    // Attach elements to sandbox
    flashForm.appendChild(card);
    flashForm.appendChild(choose);
    sandbox.appendChild(flashForm);
    

    // Recieve response
    retrieve("/flash_card/showSets").then(data => {
    console.log(data);
    // Make a table with user options
    rowAmnt = Object.keys(data).length;
    console.log(rowAmnt);
    const flashtable = createTable(rowAmnt,1,data);
    card.appendChild(flashtable);
    });
    


    // When user chooses which set make another get request
    choose.addEventListener('click', () => {
        // 1. Get all checkboxes (adjust selector as needed)
        const checkboxes = sandbox.querySelectorAll('input[type="checkbox"]');

        // 2. Filter checked ones
        const checked = Array.from(checkboxes).filter(box => box.checked);

        // 3. Extract their values
        const values = checked.map(box => box.value);

        // 4. Use the values

        // Make a query to retrieve all the flashcards from each set
        retrieve("/flash_card/showSets")
        .then(function extractIds(data){
            let setIds = []; // Default decleration

            for(let i = 0; i < Object.keys(data).length; i++){
                if(values[i] == data[i].set_name){
                    //Flashcard set is within values so extract
                    setIds.push(i);
                }
                else{
                    continue;
                }
            }
            return  setIds;
        })
        .then( setIds => retrieve("/flash_card/renderCards",setIds,"set_id"));       

    });


})



// ALL eventListners here correspond to deleting a flashcard set
deletebtn.addEventListener("click", function(){
    sandbox.innerHTML = ''; // Clear the sanbox

})


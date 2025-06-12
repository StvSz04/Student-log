
// Define class
class Flashcard {
  constructor(frontText, backText) {
    this.front = frontText;
    this.back = backText;
    this.isFront = true;
  }
  
    // Upadate text info on card
    updateText(frontText, backText) {
        this.front = frontText;
        this.back = backText;
    }

    updateBool(){
        this.isFront ? this.isFront = false : this.isFront = true;
    }


}

let flashcardArr = [];
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

// This function creates a label
function createLabel(id,text){
    const flashlabel = document.createElement("label");
    flashlabel.id = id;
    flashlabel.textContent = text; 
    return flashlabel;
}

function createTable(rowAmnt, colAmnt,data) {
    const table = document.createElement("table");

    for (let i = 0; i < rowAmnt; i++) {
        const row = table.insertRow(); // Create row
        const cell = row.insertCell(); // Create cell in row
        checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = data[i].set_name;
        checkbox.value = data[i].set_name; // + 1 to match sqlite tabel autoincrement starting at 1
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


    // Create elements of selection menu
    const flashForm = document.createElement("form");
    // Create div to hold cards
    const cardDiv = document.createElement("div");

    // Create table div
    const tableDiv = document.createElement('div');
    choose  = createButton("choose", "Choose", "button");

    // Attach elements to sandbox
    // flashForm.appendChild(card.cardDiv);
    flashForm.appendChild(tableDiv);
    flashForm.appendChild(choose);
    sandbox.appendChild(flashForm);
    

    // Recieve response
    retrieve("/flash_card/showSets").then(data => {

    // Make a table with user options
    rowAmnt = Object.keys(data).length;
    const flashtable = createTable(rowAmnt,1,data);
    tableDiv.appendChild(flashtable);
    });
    


    // When user chooses which set make another get request
    choose.addEventListener('click', () => {

        // Define a choose variable to enable swapping between cards
        let count = {value : 0, max : 0};
        // 1. Get all checkboxes (adjust selector as needed)
        const checkboxes = sandbox.querySelectorAll('input[type="checkbox"]');

        // 2. Filter checked ones
        const checked = Array.from(checkboxes).filter(box => box.checked);

        // 3. Extract their values
        const values = checked.map(box => box.value);

        // Make a query to retrieve all the flashcards from each set
        retrieve("/flash_card/showSets")
        .then(function extractIds(data){
            let set_name = []; // Default decleration

            for(let i = 0; i < Object.keys(data).length; i++){
                // If the set was selected add to set_name
                if(values.includes(data[i].set_name)){
                    //Flashcard set is within values so extract
                    set_name.push(data[i].set_name);
                }
                else{
                    continue;
                }
            }
            return  set_name;
        })
        .then( set_name => retrieve("/flash_card/renderCards",set_name,"set_name"))
        .then(function generateDeck(data){
            for(let i = 0; i < Object.keys(data).length;i++){
                flashcardArr.push(new Flashcard(data[i].front,data[i].back));
            }
            count.max = flashcardArr.length;
        })
        .then(function renderCards(){
            sandbox.innerHTML = ''; // Clear the sanbox
          
            // Add buttons for back,flip,and next actions
            cardDiv.appendChild(createButton("back","Back","button"));
            cardDiv.appendChild(createButton("flip","Flip","button"));
            cardDiv.appendChild(createButton("next","Next","button"));
        

            // Add label to display the flashcard text
            textlabel = createLabel("flip","");
            textlabel.textContent = flashcardArr[0].front; // Display the front of the first flashcard
            cardDiv.appendChild(textlabel);

            // Add functionality to the previously created buttons
        
            // Define functionality for the next button
            const nextbtn = cardDiv.querySelector('#next');
            nextbtn.addEventListener('click', () => goToNext(count));

            function goToNext(count) {
                if (count.value + 1 < count.max) {
                    count.value++; // increment
                    textlabel.textContent = flashcardArr[count.value].front;
                } else {
                    alert("At end of cards. Cannot go next.");
                }
            }

            // Define functionality for the back button
            const backbtn = cardDiv.querySelector('#back');
            backbtn.addEventListener('click', () => goToPrev(count));

            function goToPrev(count) {
                if (count.value - 1 >= 0) {
                    count.value--; // decrement
                    textlabel.textContent = flashcardArr[count.value].front;
                } else {
                    alert("At start of cards. Cannot go back.");
                }
            }

            
            // Define functionality for the flip button
            const flipbtn = cardDiv.querySelector('#flip'); // Find and grab the flip button
            flipbtn.addEventListener('click', () => flipCard(count))

            // Define function to handle argument passing and flipping logic
            function flipCard(count){
                console.log("Entered flipCard");
                console.log(count.value);
                // If true then show back and change bool value to false otherwise do inverse
                 flashcardArr[count.value].isFront 
                 ? (textlabel.textContent = flashcardArr[count.value].back, flashcardArr[count.value].isFront = false) 
                 : (textlabel.textContent = flashcardArr[count.value].front,flashcardArr[count.value].isFront = true);
            }


            // Add newly created card to the sandbox
            sandbox.append(cardDiv);
        });       

    });
    

    
})



// ALL eventListners here correspond to deleting a flashcard set
deletebtn.addEventListener("click", function(){
    sandbox.innerHTML = ''; // Clear the sanbox

    // Create elements of selection menu
    const flashForm = document.createElement("form");
    // Create div to hold cards
    const cardDiv = document.createElement("div");

    // Create table div
    const tableDiv = document.createElement('div');
    deletebtnTwo  = createButton("delete", "Delete", "button");

    // Attach elements to sandbox
    // flashForm.appendChild(card.cardDiv);
    flashForm.appendChild(tableDiv);
    flashForm.appendChild(deletebtnTwo);
    sandbox.appendChild(flashForm);
    

    // Recieve response
    retrieve("/flash_card/showSets").then(data => {

    // Make a table with user options
    rowAmnt = Object.keys(data).length;
    const flashtable = createTable(rowAmnt,1,data);
    tableDiv.appendChild(flashtable);
    });


    deletebtnTwo.addEventListener('click', () => {

        // 1. Get all checkboxes (adjust selector as needed)
        const checkboxes = sandbox.querySelectorAll('input[type="checkbox"]');

        // 2. Filter checked ones
        const checked = Array.from(checkboxes).filter(box => box.checked);

        // 3. Extract their values
        const values = checked.map(box => box.value);

        // Make a query to retrieve all the flashcard sets
        //This retrieve returns the set_names
        retrieve("/flash_card/showSets")
        .then(function extractIds(data){
            let set_name = []; // Default decleration

            // Determine which sets are selected from user input
            for(let i = 0; i < Object.keys(data).length; i++){
                // If the set was selected add to set_name
                if(values.includes(data[i].set_name)){
                    //Flashcard set is within values so extract
                    set_name.push(data[i].set_name);
                }
                else{
                    continue;
                }
            }
            return  set_name;
        })
        .then((set_name) => retrieve("/flash_card/deleteSets",set_name,"set_name"))
        .then(() => window.location.reload());


    })
})

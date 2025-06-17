
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

const createbtnCard = document.getElementById("create-set");
const createbtnFolder = document.getElementById("create-folder");
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

function createTable(rowAmnt, colAmnt,data,field) {
    const table = document.createElement("table");

    for (let i = 0; i < rowAmnt; i++) {
        const row = table.insertRow(); // Create row
        const cell = row.insertCell(); // Create cell in row
        checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = data[i][field];
        checkbox.value = data[i][field];
        const label = document.createElement("label");
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(data[i][field]));
        cell.appendChild(label);
    }

    return table;
}

// Make a request to backend
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

// This function sends a request to the backend for all user folders
function selectAddOptions(){
    return retrieve('/flash_card/sendFolders');
}

// This funciton sends a request to the backend for user selected flashcards
async function retrieveFlashcards(destination,data,string){
    let response = null;

    if (data){
        const queryString = data.map(id => `${string}=${id.set_name}`).join('&');
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
createbtnCard.addEventListener("click", function () {
    sandbox.innerHTML = '';

    
  // Initialize set name input and label
    const setName = document.createElement('input');
    setName.type = 'text';                 // text input
    setName.name = 'set-name';            // form submission key
    setName.placeholder = 'Enter set name'; // Optional user-friendly hints

    const hiddenInputTwo = document.createElement('input');
    hiddenInputTwo.type = 'hidden';
    hiddenInputTwo.name = 'card-count';

    // Define folder selection
    const folderSelect = document.createElement("select");
    folderSelect.name = "folder-name";
    // Create default prompt for user
    defualtOption = document.createElement('option');
    defualtOption.textContent = "Choose folder";
    defualtOption.disabled = true;
    defualtOption.selected = true;     
    folderSelect.add(defualtOption);

    // Add options to select from respsonse
    selectAddOptions()
    .then(folders => {
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.folder_name;
            option.textContent = folder.folder_name;
            folderSelect.appendChild(option); 
        });
    });

    // Define basic elements of form
    let cardCount = 0;
    const card = document.createElement("div");
    card.classList.add("flashcard");
    const flashForm = document.createElement("form");
    flashForm.method = "POST";
    flashForm.action = "/flash_card/flashCreate";
    const frontInput = document.createElement("input");
    frontInput.name = 'front' + cardCount;
    const backInput = document.createElement("input");
    backInput.name = 'back' + cardCount;

    // Attach elements to form
    flashForm.appendChild(setName);
    flashForm.appendChild(hiddenInputTwo);
    flashForm.appendChild(folderSelect);
    flashForm.appendChild(frontInput);
    flashForm.appendChild(backInput);

    const newFlashCardbtn = createButton("new", "New Card", "Button")
    const submitbtn = createButton("submit", "Submit", "Submit");

    flashForm.appendChild(newFlashCardbtn);
    flashForm.appendChild(submitbtn);
    card.appendChild(flashForm);
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

createbtnFolder.addEventListener("click", function () {
    
    // Clear sandbox
    sandbox.innerHTML = '';

    // Create card to hold content
    const card = document.createElement("div");
    card.classList.add("flashcard");

    // Initialize folder input for name
    const nameText = document.createElement('input');
    nameText.name = "folder-name";
    nameText.required = true;
    nameText.placeholder = "Enter New Folder Name";

    // Create submit button
    const submitbtn = createButton("submit", "Submit", "Submit");

    // Create form to be used to submuit
    const flashForm = document.createElement("form");
    flashForm.method = "POST";
    flashForm.action = "/flash_card/folderCreate";

    // Attach button to form
    flashForm.appendChild(nameText);
    flashForm.appendChild(submitbtn);
    card.appendChild(flashForm);
    sandbox.append(card);

})


// ALL eventListners here correspond to using a flashcard set
usebtn.addEventListener("click", function(){

    sandbox.innerHTML = ''; // Clear the sanbox

    // Define folder name
    let folder_name = "";


    // Create entry form
    const flashForm = document.createElement("form");
    // Create div to hold form
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("flashcard");


    // Create table div
    const tableDiv = document.createElement('div');
    const buttondiv = document.createElement('div');
    choose  = createButton("choose", "Choose", "button");

    // Attach elements
    buttondiv.appendChild(choose);
    flashForm.appendChild(tableDiv);
    flashForm.appendChild(buttondiv);
    cardDiv.appendChild(flashForm);
    sandbox.appendChild(cardDiv);
    

    // Recieve response
    retrieve("/flash_card/sendFolders").then(data => {

    // Make a table with user options
    rowAmnt = Object.keys(data).length;
    const flashtable = createTable(rowAmnt,1,data,"folder_name");
    tableDiv.appendChild(flashtable);
    });
    


    // When user chooses which set make another get request
    choose.addEventListener('click', () => {
        // 1. Get all checkboxes (adjust selector as needed)
        const checkboxes = sandbox.querySelectorAll('input[type="checkbox"]');

        // 2. Filter checked ones
        const checked = Array.from(checkboxes).filter(box => box.checked);

        // 3. Extract their values
        const values = checked.map(box => box.value);


        // Remove the form from the card to allow space to present actual card front and back
        cardDiv.removeChild(flashForm);

        // Make a query to retrieve all the flashcards from each set
        retrieve("/flash_card/sendFolders")
        .then(function extractIds(data){
            let folderList = []; // Default decleration

            for(let i = 0; i < Object.keys(data).length; i++){
                // If the set was selected add to set_name
                if(values.includes(data[i].folder_name)){
                    //Flashcard set is within values so extract
                    folderList.push(data[i].folder_name);
                }
                else{
                    continue;
                }
            }
            // Return list that contains all user selected user folders
            return folderList;
        })
        .then(function (folderList) {
                // Make a query to retrieve all the flashcards from each set
                retrieve("/flash_card/listSet", folderList, "folder_list")
                .then(function tableSet(setList){

                    sandbox.innerHTML = ''; // Clear the sandbox

                    // Create new choose button
                    choose  = createButton("choosetwo", "Choose2", "button");
                    buttondiv.appendChild(choose);

                    const setTableContainer = document.createElement('div');
                    const setFormButtonContainer = document.createElement('div');
                    const setSelectionForm = document.createElement('form');
                    const flashcardContainer = document.createElement('div');

                    const totalRows = Object.keys(setList).length;
                    const flashcardTable = createTable(totalRows, 1, setList, "set_name");

                    setTableContainer.appendChild(flashcardTable);
                    flashcardContainer.classList.add("flashcard");

                    const chooseSetButton = createButton("choose", "Choose", "button");

                    // Attach elements
                    setFormButtonContainer.appendChild(chooseSetButton);
                    setSelectionForm.appendChild(setTableContainer);
                    setSelectionForm.appendChild(setFormButtonContainer);
                    flashcardContainer.appendChild(setSelectionForm);
                    sandbox.appendChild(flashcardContainer);

                    returnArr = [];
                    returnArr.push(chooseSetButton);
                    returnArr.push(setList);
                    
                    return (returnArr);
                })
                .then( returnArr => {
                    returnArr[0].addEventListener('click', () => displaySets(returnArr[1]));
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
    cardDiv.classList.add("flashcard");


    // Create table div
    const tableDiv = document.createElement('div');
    deletebtnTwo  = createButton("delete", "Delete", "button");

    // Attach elements to sandbox
    // flashForm.appendChild(card.cardDiv);
    flashForm.appendChild(tableDiv);
    flashForm.appendChild(deletebtnTwo);
    cardDiv.appendChild(flashForm);
    sandbox.appendChild(cardDiv);
    

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
})


// This function makes a GET request to then display the flashcards
function displaySets(set_name){
    // Define a choose variable to enable swapping between cards
    let count = {value : 0, max : 0};

    retrieveFlashcards("/flash_card/renderCards",set_name,"set_name")
    .then(function generateDeck(data){
        for(let i = 0; i < Object.keys(data).length;i++){
            flashcardArr.push(new Flashcard(data[i].front,data[i].back));
        }
        
        count.max = flashcardArr.length;
    })
    .then(function renderCards(){
            sandbox.innerHTML = ''; // Clear the sanbox
                
            // Add label to display the flashcard text
            textlabel = createLabel("fliplabel","");
            textlabel.textContent = flashcardArr[0].front; // Display the front of the first flashcard
            const cardDiv = document.createElement('div');
            cardDiv.classList.add("flashcard");
            cardDiv.appendChild(textlabel);

            // Add buttons for back,flip,and next actions
            cardDiv.appendChild(createButton("back","Back","button"));
            cardDiv.appendChild(createButton("flip","Flip","button"));
            cardDiv.appendChild(createButton("next","Next","button"));
                

            // Add functionality to the previously created buttons
                
            // Define functionality for the next button
            const nextbtn = cardDiv.querySelector('#next');
            nextbtn.addEventListener('click', () => goToNext(count));

            function goToNext(count) {
                if (count.value + 1 < count.max) {
                    count.value++; // increment
                    textlabel.textContent = flashcardArr[count.value].front;
                }
                            
                        
            }

            // Define functionality for the back button
            const backbtn = cardDiv.querySelector('#back');
            backbtn.addEventListener('click', () => goToPrev(count));

            function goToPrev(count) {
                if (count.value - 1 >= 0) {
                    count.value--; // decrement
                    textlabel.textContent = flashcardArr[count.value].front;
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
}

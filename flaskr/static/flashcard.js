import {
  createButton,
  createLabel,
  createTable,
  retrieve,
  selectAddOptions,
  retrieveFlashcards,
  Flashcard,
  displaySets,
  deleteSets,
  deleteFolders
} from './flashcardHelpers.js';


const createbtnCard = document.getElementById("create-set");
const createbtnFolder = document.getElementById("create-folder");
const usebtn = document.getElementById("use");
const deletebtn = document.getElementById("delete");

// sanbox correpsonds to the div that all 3 buttons will use to diplay info
let sandbox = document.getElementById("sandbox-div") 



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
    let defaultOption = document.createElement('option');
    defaultOption.textContent = "Choose folder";
    defaultOption.disabled = true;
    defaultOption.selected = true;     
    folderSelect.add(defaultOption);

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
    let choose  = createButton("choose", "Choose", "button");

    // Attach elements
    buttondiv.appendChild(choose);
    flashForm.appendChild(tableDiv);
    flashForm.appendChild(buttondiv);
    cardDiv.appendChild(flashForm);
    sandbox.appendChild(cardDiv);
    

    // Recieve response
    retrieve("/flash_card/sendFolders").then(data => {

    // Make a table with user options
    let rowAmnt = Object.keys(data).length;
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

                    let returnArr = [];
                    returnArr.push(chooseSetButton);
                    returnArr.push(setList);
                    
                    return (returnArr);
                })
                .then( returnArr => {
                    returnArr[0].addEventListener('click', () => displaySets(returnArr[1],sandbox));
                });
        });
    
    })

})

// Event listener for deleting flashcard sets or folders
deletebtn.addEventListener("click", function () {
    sandbox.innerHTML = ''; // Clear the sandbox

    // Create form container
    const deleteForm = document.createElement("form");
    const flashcardContainerDel = document.createElement("div");
    flashcardContainerDel.classList.add("flashcard");

    // Create dropdown selector
    const deleteTypeSelect = document.createElement('select');
    deleteTypeSelect.name = "deleteType";

    const defaultOption = new Option("Delete Folder or Set?", "", true, true);
    defaultOption.disabled = true;

    const folderOption = new Option("Delete Folder", "Folder");
    const setOption = new Option("Delete Set", "Set");

    deleteTypeSelect.add(defaultOption, undefined);
    deleteTypeSelect.add(folderOption);
    deleteTypeSelect.add(setOption);

    // Create choose button
    const chooseButton = createButton("choose-delete", "Choose", "button");

    deleteForm.append(deleteTypeSelect, chooseButton);
    flashcardContainerDel.appendChild(deleteForm);
    sandbox.appendChild(flashcardContainerDel);

    chooseButton.addEventListener('click', () => {
        const choice = deleteTypeSelect.value;
        sandbox.innerHTML = ''; // Clear everything for next UI
        flashcardContainerDel.innerHTML = '';

        if (choice === "Folder") {
            retrieve("/flash_card/sendFolders").then(data => {
                const tableContainer = document.createElement("div");
                const folderTable = createTable(data.length, 1, data, "folder_name");
                const deleteFolderBtn = createButton("delete-folder", "Delete Folder", "button");

                tableContainer.appendChild(folderTable);
                flashcardContainerDel.appendChild(tableContainer);
                flashcardContainerDel.appendChild(deleteFolderBtn);
                sandbox.append(flashcardContainerDel);

                deleteFolderBtn.addEventListener('click', () => {
                     // 1. Get all checkboxes inside sandbox (or more specific container if needed)
                        const checkboxes = sandbox.querySelectorAll('input[type="checkbox"]');

                        // 2. Filter only the checked ones
                        const checked = Array.from(checkboxes).filter(box => box.checked);

                        // 3. Extract their values (these should be set_name if your table was made that way)
                        const selectedFolderNames = checked.map(box => box.value);

                        // 4. Pass to deleteSets
                        deleteFolders(selectedFolderNames, "folder_name")
                        .then(() => {
                         window.location.reload();
                        });
                });
            });

        } else if (choice === "Set") {
            retrieve("/flash_card/sendFolders")
                .then(data => {
                    const folderTable = createTable(data.length, 1, data, "folder_name");
                    const selectFolderBtn = createButton("select-folder", "Choose Folder(s) to Enter", "button");

                    const formContainer = document.createElement("form");
                    formContainer.append(folderTable, selectFolderBtn);
                    flashcardContainerDel.appendChild(formContainer);
                    sandbox.appendChild(flashcardContainerDel);

                    selectFolderBtn.addEventListener("click", () => {
                        const checkedFolders = [...sandbox.querySelectorAll('input[type="checkbox"]:checked')]
                            .map(box => box.value);

                        retrieve("/flash_card/listSet", checkedFolders, "folder_list")
                            .then(setList => {
                                sandbox.innerHTML = '';
                                flashcardContainerDel.innerHTML = '';

                                const setTable = createTable(setList.length, 1, setList, "set_name");
                                const deleteSetBtn = createButton("delete-set", "Delete", "button");

                                flashcardContainerDel.appendChild(setTable);
                                flashcardContainerDel.appendChild(deleteSetBtn);
                                sandbox.appendChild(flashcardContainerDel);

                                deleteSetBtn.addEventListener('click', () => {
                                        // 1. Get all checkboxes inside sandbox (or more specific container if needed)
                                        const checkboxes = sandbox.querySelectorAll('input[type="checkbox"]');

                                        // 2. Filter only the checked ones
                                        const checked = Array.from(checkboxes).filter(box => box.checked);

                                        // 3. Extract their values (these should be set_name if your table was made that way)
                                        const selectedSetNames = checked.map(box => box.value);

                                        // 4. Pass to deleteSets
                                        deleteSets(selectedSetNames, "set_name")
                                        .then(() => {
                                            window.location.reload();
                                        });
                                });
                            });
                    });
                });
        }
    });
});





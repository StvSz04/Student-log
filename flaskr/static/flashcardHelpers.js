// Define class
export class Flashcard {
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

    updateBool() {
        this.isFront ? this.isFront = false : this.isFront = true;
    }


}



// This function creates instances of buttons;
export function createButton(id, text, type) {
    const btn = document.createElement("button");
    btn.type = type;
    btn.id = id;
    btn.textContent = text;
    return btn;
}

// This function creates a label
export function createLabel(id, text) {
    const flashlabel = document.createElement("label");
    flashlabel.id = id;
    flashlabel.textContent = text;
    return flashlabel;
}

export function createTable(rowAmnt, colAmnt, data, field) {
    const table = document.createElement("table");

    for (let i = 0; i < rowAmnt; i++) {
        const row = table.insertRow(); // Create row
        const cell = row.insertCell(); // Create cell in row
        let checkbox = document.createElement("input");
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
export async function retrieve(destination, data, string) {
    let response = null;

    if (data) {
        const queryString = data.map(id => `${string}=${id}`).join('&');
        response = await fetch(destination + "?" + queryString);
    }
    else {
        response = await fetch(destination);
    }

    if (!response.ok) throw new Error("Fetch failed");
    const answer = await response.json(); // or response.text() if not JSON
    return answer;
}

// This function sends a request to the backend for all user folders
export function selectAddOptions() {
    return retrieve('/flash_card/sendFolders');
}

// This funciton sends a request to the backend for user selected flashcards
export async function retrieveFlashcards(destination, data, string) {
    let response = null;

    if (data) {
        const queryString = data.map(id => `${string}=${id}`).join('&');
        response = await fetch(destination + "?" + queryString);
    }
    else {
        response = await fetch(destination);
    }

    if (!response.ok) throw new Error("Fetch failed");
    const answer = await response.json(); // or response.text() if not JSON
    return answer;
}

// This function makes a GET request to then display the flashcards
export function displaySets(set_name, sandbox) {
    // Define a choose variable to enable swapping between cards
    let count = { value: 0, max: 0 };
    let flashcardArr = [];

    retrieveFlashcards("/flash_card/renderCards", set_name, "set_name")
        .then(function generateDeck(data) {
            for (let i = 0; i < Object.keys(data).length; i++) {
                flashcardArr.push(new Flashcard(data[i].front, data[i].back));
            }

            count.max = flashcardArr.length;
        })
        .then(function renderCards() {
            sandbox.innerHTML = ''; // Clear the sandbox

            // Add label to display the flashcard text
            let textlabel = createLabel("fliplabel", "");
            textlabel.textContent = flashcardArr[0].front; // Display the front of the first flashcard
            const cardDiv = document.createElement('div');
            cardDiv.classList.add("flashcard");
            cardDiv.appendChild(textlabel);

            // Add buttons for back,flip,and next actions
            cardDiv.appendChild(createButton("back", "Back", "button"));
            cardDiv.appendChild(createButton("flip", "Flip", "button"));
            cardDiv.appendChild(createButton("next", "Next", "button"));


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
            function flipCard(count) {
                // If true then show back and change bool value to false otherwise do inverse
                flashcardArr[count.value].isFront
                    ? (textlabel.textContent = flashcardArr[count.value].back, flashcardArr[count.value].isFront = false)
                    : (textlabel.textContent = flashcardArr[count.value].front, flashcardArr[count.value].isFront = true);
            }


            // Add newly created card to the sandbox
            sandbox.append(cardDiv);
        });
}

export function deleteSets(setList) {
    return retrieve('/flash_card/deleteSets', setList, "set_name");
}

export function deleteFolders(folderList) {
    return retrieve('/flash_card/deleteFolders', folderList, "folder_name");
}

export function createFlashInputs(cardCount) {
    const frontInput = document.createElement("input");
    frontInput.placeholder = "Enter front"
    frontInput.name = 'front' + cardCount;
    frontInput.id = cardCount
    const backInput = document.createElement("input");
    backInput.placeholder = "Enter back"
    backInput.name = 'back' + cardCount;
    backInput.id = cardCount

    return [frontInput, backInput]
}

export function restoreCards(card, cardCount) {
    const frontInput = document.createElement("input");
    frontInput.value = card.front;
    frontInput.name = 'front' + cardCount;
    frontInput.id = cardCount
    const backInput = document.createElement("input");
    backInput.value = card.back;
    backInput.name = 'back' + cardCount;
    backInput.id = cardCount

    return [frontInput, backInput]
}

export function createListnerTools(cardCount) {
    const frontstartbutton = createButton("front-start " + cardCount, "Start", "button");
    const frontstopbutton = createButton("front-stop " + cardCount, "Stop", "button");
    const backstartbutton = createButton("back-start " + cardCount, "Start", "button");
    const backstopbutton = createButton("back-stop " + cardCount, "Stop", "button");

    return [frontstartbutton, frontstopbutton, backstartbutton, backstopbutton];
}

export function createListeningFunction(startbutton, stopbutton, label) {

}

export function createSet(sandbox) {
    // Clear the sandbox to remove any previous content
    sandbox.innerHTML = '';

    // === Initialize the set name input ===
    const setName = document.createElement('input');
    setName.type = 'text';                      // Standard text input
    setName.name = 'set-name';                 // Used as key in form submission
    setName.placeholder = 'Enter set name';    // Hint for user

    // === Hidden input to store card count (used on form submission) ===
    const hiddenInputTwo = document.createElement('input');
    hiddenInputTwo.type = 'hidden';
    hiddenInputTwo.name = 'card-count';

    // === Dropdown menu for selecting a folder ===
    const folderSelect = document.createElement("select");
    folderSelect.name = "folder-name";

    // Create a disabled default option to prompt the user
    let defaultOption = document.createElement('option');
    defaultOption.textContent = "Choose folder";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    folderSelect.add(defaultOption);

    // Dynamically populate folder dropdown options from server
    selectAddOptions().then(folders => {
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.folder_name;
            option.textContent = folder.folder_name;
            folderSelect.appendChild(option);
        });
    });

    // === Set up form and card container ===
    let cardCount = 0; // Tracks the number of flashcards created
    const card = document.createElement("div");
    card.classList.add("flashcard"); // Main container for the card UI

    const flashForm = document.createElement("form");
    flashForm.method = "POST";
    flashForm.action = "/flash_card/flashCreate";

    const inputDiv = document.createElement('div'); // Container for flashcard input pairs

    // Create initial input fields and speech recognition buttons
    let returnedCreateFlashInputs = createFlashInputs(cardCount);
    // let returnedCreateListnerTools = createListnerTools(cardCount);

    // Append inputs and tools in order: front input → front tools → back input → back tools
    inputDiv.appendChild(returnedCreateFlashInputs[0]);       // Front input
    inputDiv.appendChild(returnedCreateFlashInputs[1]);       // Back input

    let deletebtn = createButton("delete-card", "DELETE", "button")
            inputDiv.appendChild(deletebtn);

            deletebtn.addEventListener('click', () => {
                    // Remove the front input
                returnedCreateFlashInputs[0].type = 'hidden';
                returnedCreateFlashInputs[0].value = "deleted";
                // Remove the back input
                returnedCreateFlashInputs[1].type = 'hidden';
                returnedCreateFlashInputs[1].value =  "deleted";
                // Remove the delete button itself
                inputDiv.removeChild(deletebtn);
            });

    // Assemble the form
    flashForm.appendChild(setName);
    flashForm.appendChild(hiddenInputTwo);
    flashForm.appendChild(folderSelect);
    flashForm.appendChild(inputDiv);

    // Create "New Card" and "Submit" buttons
    const newFlashCardbtn = createButton("new", "New Card", "Button");
    const submitbtn = createButton("submit", "Submit", "Submit");

    flashForm.appendChild(newFlashCardbtn);
    flashForm.appendChild(submitbtn);
    card.appendChild(flashForm);
    sandbox.appendChild(card);

    // === Handler to add new flashcard input pair ===
    newFlashCardbtn.addEventListener("click", function (event) {
        
        try {


            // Grab the last input (used to insert the new card after it)
            let lastInput = flashForm.elements[flashForm.elements.length - 3];

            // Increment card count and create new inputs/buttons
            const returnedCreateFlashInputs = createFlashInputs(cardCount);
            // returnedCreateListnerTools = createListnerTools(cardCount);

            // Insert front input and associated buttons
            inputDiv.insertBefore(returnedCreateFlashInputs[0], lastInput.nextSibling)

            // Insert back input and associated buttons
            inputDiv.appendChild(returnedCreateFlashInputs[1]);

            cardCount += 1;


            let deletebtn = createButton("delete-card", "DELETE", "button")
            inputDiv.appendChild(deletebtn);

            deletebtn.addEventListener('click', () => {
                // Remove the front input
                inputDiv.removeChild(returnedCreateFlashInputs[0]);
                // Remove the back input
                inputDiv.removeChild(returnedCreateFlashInputs[1]);
                // Remove the delete button itself
                inputDiv.removeChild(deletebtn);

                cardCount -= 1;
            });
        }
        catch {
            // Increment card count and create new inputs/buttons
            const returnedCreateFlashInputs = createFlashInputs(cardCount);
            // returnedCreateListnerTools = createListnerTools(cardCount);

            // Insert front input and associated buttons
            inputDiv.appendChild(returnedCreateFlashInputs[0])

            // Insert back input and associated buttons
            inputDiv.appendChild(returnedCreateFlashInputs[1]);


            let deletebtn = createButton("delete-card", "DELETE", "button")
            inputDiv.appendChild(deletebtn);


            cardCount += 1;

            deletebtn.addEventListener('click', () => {
                // Remove the front input
                returnedCreateFlashInputs[0].type = 'hidden';
                returnedCreateFlashInputs[0].value = "deleted";
                // Remove the back input
                returnedCreateFlashInputs[1].type = 'hidden';
                returnedCreateFlashInputs[1].value =  "deleted";
                // Remove the delete button itself
                inputDiv.removeChild(deletebtn);
            });
        }



    });

    // === On form submit, store the final number of flashcards ===
    flashForm.addEventListener('submit', function (event) {
        hiddenInputTwo.value = cardCount + 1; // Add 1 because cardCount is 0-based
    });
}

export function createFolder(sandbox) {

    // === Clear previous content from the sandbox ===
    sandbox.innerHTML = '';

    // === Create a container div to hold the form ===
    const card = document.createElement("div");
    card.classList.add("flashcard"); // Optional: reuse same styling as flashcards

    // === Create text input for folder name ===
    const nameText = document.createElement('input');
    nameText.name = "folder-name";                     // Key used in form submission
    nameText.required = true;                          // Prevent form submission without input
    nameText.placeholder = "Enter New Folder Name";    // Hint text for the user

    // === Create a submit button ===
    const submitbtn = createButton("submit", "Submit", "Submit");

    // === Create the form to wrap input and submit button ===
    const flashForm = document.createElement("form");
    flashForm.method = "POST";                         // Form will send a POST request
    flashForm.action = "/flash_card/folderCreate";     // Target route for form submission

    // === Assemble and attach elements ===
    flashForm.appendChild(nameText);                   // Add input to form
    flashForm.appendChild(submitbtn);                  // Add submit button to form
    card.appendChild(flashForm);                       // Add form to card container
    sandbox.append(card);                              // Add card to the main UI
}

export function creatUsebtn(sandbox) {// === Clear any previous content ===
    sandbox.innerHTML = '';

    // === Set up UI ===
    let folder_name = ""; // (Optional) to track selected folder if needed

    // Create a form for selecting folders
    const flashForm = document.createElement("form");

    // Main container for the UI
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("flashcard");

    // Container for the dynamic table of folders
    const tableDiv = document.createElement('div');

    // Container for action buttons
    const buttondiv = document.createElement('div');

    // "Choose" button to confirm selected folders
    let choose = createButton("choose", "Choose", "button");

    // Assemble the form UI
    buttondiv.appendChild(choose);
    flashForm.appendChild(tableDiv);      // Will hold the folder selection table
    flashForm.appendChild(buttondiv);     // Holds the "Choose" button
    cardDiv.appendChild(flashForm);       // Add form to card container
    sandbox.appendChild(cardDiv);         // Inject into the page

    // === Fetch available folder options from the backend ===
    retrieve("/flash_card/sendFolders").then(data => {
        const rowAmnt = Object.keys(data).length;

        // Create a 1-column table displaying folder names with checkboxes
        const flashtable = createTable(rowAmnt, 1, data, "folder_name");
        tableDiv.appendChild(flashtable);
    });

    // === Handle folder selection ===
    choose.addEventListener('click', () => {
        // 1. Get all folder checkboxes
        const checkboxes = sandbox.querySelectorAll('input[type="checkbox"]');

        // 2. Filter those that are checked
        const checked = Array.from(checkboxes).filter(box => box.checked);

        // 3. Extract the selected folder names
        const values = checked.map(box => box.value);

        // Remove the folder selection form to make room for next UI
        cardDiv.removeChild(flashForm);

        // === Re-fetch folder data and match selected folders ===
        retrieve("/flash_card/sendFolders")
            .then(function extractIds(data) {
                let folderList = [];

                for (let i = 0; i < Object.keys(data).length; i++) {
                    if (values.includes(data[i].folder_name)) {
                        folderList.push(data[i].folder_name);
                    }
                }

                // Return list of selected folder names
                return folderList;
            })
            .then(function (folderList) {
                // === Now retrieve flashcard sets inside the selected folders ===
                retrieve("/flash_card/listSet", folderList, "folder_list")
                    .then(function tableSet(setList) {
                        // Clear the sandbox to prepare for flashcard set selection
                        sandbox.innerHTML = '';

                        // Create UI containers
                        choose = createButton("choosetwo", "Choose2", "button");
                        buttondiv.appendChild(choose);

                        const setTableContainer = document.createElement('div');
                        const setFormButtonContainer = document.createElement('div');
                        const setSelectionForm = document.createElement('form');
                        const flashcardContainer = document.createElement('div');

                        // Create table of flashcard sets
                        const totalRows = Object.keys(setList).length;
                        const flashcardTable = createTable(totalRows, 1, setList, "set_name");
                        setTableContainer.appendChild(flashcardTable);

                        // Apply styling class
                        flashcardContainer.classList.add("flashcard");

                        // Add final selection button
                        const chooseSetButton = createButton("choose", "Choose", "button");

                        // Assemble UI structure
                        setFormButtonContainer.appendChild(chooseSetButton);
                        setSelectionForm.appendChild(setTableContainer);
                        setSelectionForm.appendChild(setFormButtonContainer);
                        flashcardContainer.appendChild(setSelectionForm);
                        sandbox.appendChild(flashcardContainer);

                        // Return button so we can add listener
                        return [chooseSetButton];
                    })
                    .then(returnArr => {
                        // Add event listener to the final "Choose" button
                        returnArr[0].addEventListener('click', () => {
                            // 1. Get all flashcard set checkboxes
                            const checkboxesFlashSets = sandbox.querySelectorAll('input[type="checkbox"]');

                            // 2. Filter checked sets
                            const checkedFlashSets = Array.from(checkboxesFlashSets).filter(box => box.checked);

                            // 3. Extract set names from checkboxes
                            const valuesFlashSets = checkedFlashSets.map(box => box.value);

                            // === Display the selected flashcard sets ===
                            displaySets(valuesFlashSets, sandbox);
                        });
                    });
            });
    });
}

export function createDeletebtn(sandbox) {
    // === Step 1: Clear UI and initialize containers ===
    sandbox.innerHTML = ''; // Clear the sandbox display area

    const deleteForm = document.createElement("form"); // Form for delete type selection
    const flashcardContainerDel = document.createElement("div");
    flashcardContainerDel.classList.add("flashcard"); // Apply shared card styling

    // === Step 2: Create dropdown to choose delete type ===
    const deleteTypeSelect = document.createElement('select');
    deleteTypeSelect.name = "deleteType";

    const defaultOption = new Option("Delete Folder or Set?", "", true, true);
    defaultOption.disabled = true;

    const folderOption = new Option("Delete Folder", "Folder");
    const setOption = new Option("Delete Set", "Set");

    deleteTypeSelect.add(defaultOption);
    deleteTypeSelect.add(folderOption);
    deleteTypeSelect.add(setOption);

    // === Step 3: Create "Choose" button to confirm delete type ===
    const chooseButton = createButton("choose-delete", "Choose", "button");

    // Assemble and display the form
    deleteForm.append(deleteTypeSelect, chooseButton);
    flashcardContainerDel.appendChild(deleteForm);
    sandbox.appendChild(flashcardContainerDel);

    // === Step 4: Respond to user selecting delete type ===
    chooseButton.addEventListener('click', () => {
        const choice = deleteTypeSelect.value;

        // Clear UI for next step
        sandbox.innerHTML = '';
        flashcardContainerDel.innerHTML = '';

        // === If deleting a folder ===
        if (choice === "Folder") {
            retrieve("/flash_card/sendFolders").then(data => {
                const tableContainer = document.createElement("div");
                const folderTable = createTable(data.length, 1, data, "folder_name");
                const deleteFolderBtn = createButton("delete-folder", "Delete Folder", "button");

                // Display the folder selection table and delete button
                tableContainer.appendChild(folderTable);
                flashcardContainerDel.appendChild(tableContainer);
                flashcardContainerDel.appendChild(deleteFolderBtn);
                sandbox.appendChild(flashcardContainerDel);

                // === Confirm deletion of selected folders ===
                deleteFolderBtn.addEventListener('click', () => {
                    const checkboxes = sandbox.querySelectorAll('input[type="checkbox"]');
                    const checked = Array.from(checkboxes).filter(box => box.checked);
                    const selectedFolderNames = checked.map(box => box.value);

                    deleteFolders(selectedFolderNames, "folder_name")
                        .then(() => {
                            window.location.reload(); // Refresh after deletion
                        });
                });
            });

            // === If deleting a set ===
        } else if (choice === "Set") {
            // Step 1: Let user choose folders to look inside
            retrieve("/flash_card/sendFolders").then(data => {
                const folderTable = createTable(data.length, 1, data, "folder_name");
                const selectFolderBtn = createButton("select-folder", "Choose Folder(s) to Enter", "button");

                const formContainer = document.createElement("form");
                formContainer.append(folderTable, selectFolderBtn);
                flashcardContainerDel.appendChild(formContainer);
                sandbox.appendChild(flashcardContainerDel);

                // Step 2: Once folders are selected, show sets inside
                selectFolderBtn.addEventListener("click", () => {
                    const checkedFolders = [...sandbox.querySelectorAll('input[type="checkbox"]:checked')]
                        .map(box => box.value);

                    retrieve("/flash_card/listSet", checkedFolders, "folder_list")
                        .then(setList => {
                            sandbox.innerHTML = '';
                            flashcardContainerDel.innerHTML = '';

                            const setTable = createTable(setList.length, 1, setList, "set_name");
                            const deleteSetBtn = createButton("delete-set", "Delete", "button");

                            // Show sets and delete button
                            flashcardContainerDel.appendChild(setTable);
                            flashcardContainerDel.appendChild(deleteSetBtn);
                            sandbox.appendChild(flashcardContainerDel);

                            // Step 3: Confirm deletion of selected sets
                            deleteSetBtn.addEventListener('click', () => {
                                const checkboxes = sandbox.querySelectorAll('input[type="checkbox"]');
                                const checked = Array.from(checkboxes).filter(box => box.checked);
                                const selectedSetNames = checked.map(box => box.value);

                                deleteSets(selectedSetNames, "set_name")
                                    .then(() => {
                                        window.location.reload(); // Refresh after deletion
                                    });
                            });
                        });
                });
            });
        }
    });
}

export function populateEntries(set_name, sandbox) {
    sandbox.innerHTML = '';

    // === Hidden input to store card count (used on form submission) ===
    const hiddenInputTwo = document.createElement('input');
    hiddenInputTwo.type = 'hidden';
    hiddenInputTwo.name = 'card-count';

    // === Hidden input to store card count (used on form submission) ===
    const hiddenInputSetname = document.createElement('input');
    hiddenInputSetname.type = 'hidden';
    hiddenInputSetname.name = 'set-name';
    hiddenInputSetname.value = set_name[0];


    // === Initialize the set name input ===
    const setNameInput = document.createElement('input');
    setNameInput.type = 'text';                      // Standard text input
    setNameInput.name = 'new-set-name';                 // Used as key in form submission
    setNameInput.value = set_name[0];


    // === Dropdown menu for selecting a folder ===
    const folderSelect = document.createElement("select");
    folderSelect.name = "folder-name";

    // Dynamically populate folder dropdown options from server
    selectAddOptions().then(folders => {
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.folder_name;
            option.textContent = folder.folder_name;
            folderSelect.appendChild(option);
        })

    });

    // === Set up form and card container ===
    let cardCount = 0; // Tracks the number of flashcards created
    const card = document.createElement("div");
    card.classList.add("flashcard"); // Main container for the card UI

    const flashForm = document.createElement("form");
    flashForm.method = "POST";
    flashForm.action = "/flash_card/flashUpdate";

    const inputDiv = document.createElement('div'); // Container for flashcard input pairs
    inputDiv.className = "inputDiv";

    // Create initial input fields
    retrieveFlashcards("/flash_card/renderCards", set_name, "set_name")
        .then((data) => {
            for (const flashcard of data) {

                // For each flashcard restore the input fields
                let returnedCreateFlashInputs = restoreCards(flashcard, cardCount);

                // Append inputs
                inputDiv.appendChild(returnedCreateFlashInputs[0]);       // Front input
                inputDiv.appendChild(returnedCreateFlashInputs[1]);       // Back input

                // Increment count
                cardCount += 1;

                let deletebtn = createButton("delete-card", "DELETE", "button")
                inputDiv.appendChild(deletebtn);

                deletebtn.addEventListener('click', () => {
                    // Remove the front input
                    inputDiv.removeChild(returnedCreateFlashInputs[0]);
                    // Remove the back input
                    inputDiv.removeChild(returnedCreateFlashInputs[1]);
                    // Remove the delete button itself
                    inputDiv.removeChild(deletebtn);

                    cardCount -= 1;
                });

            }
        })


    // Assemble the form
    flashForm.appendChild(setNameInput);
    flashForm.appendChild(hiddenInputTwo);
    flashForm.appendChild(hiddenInputSetname);
    flashForm.appendChild(folderSelect);
    flashForm.appendChild(inputDiv);

    // Create "New Card" and "Submit" buttons
    const newFlashCardbtn = createButton("new", "New Card", "Button");
    const submitbtn = createButton("submit", "Submit", "Submit");

    flashForm.appendChild(newFlashCardbtn);
    flashForm.appendChild(submitbtn);
    card.appendChild(flashForm);
    sandbox.appendChild(card);

    // === Handler to add new flashcard input pair ===
    newFlashCardbtn.addEventListener("click", function (event) {

        try {


            // Grab the last input (used to insert the new card after it)
            let lastInput = flashForm.elements[flashForm.elements.length - 3];

            // Increment card count and create new inputs/buttons
            const returnedCreateFlashInputs = createFlashInputs(cardCount);
            // returnedCreateListnerTools = createListnerTools(cardCount);

            // Insert front input and associated buttons
            inputDiv.insertBefore(returnedCreateFlashInputs[0], lastInput.nextSibling)

            // Insert back input and associated buttons
            inputDiv.appendChild(returnedCreateFlashInputs[1]);


            cardCount += 1;

            let deletebtn = createButton("delete-card", "DELETE", "button")
            inputDiv.appendChild(deletebtn);

            deletebtn.addEventListener('click', () => {
                // Remove the front input
                inputDiv.removeChild(returnedCreateFlashInputs[0]);
                // Remove the back input
                inputDiv.removeChild(returnedCreateFlashInputs[1]);
                // Remove the delete button itself
                inputDiv.removeChild(deletebtn);

                cardCount -= 1;
            });
        }
        catch {
            // Increment card count and create new inputs/buttons
            const returnedCreateFlashInputs = createFlashInputs(cardCount);
            
            // Insert front input and associated buttons
            inputDiv.appendChild(returnedCreateFlashInputs[0])

            // Insert back input and associated buttons
            inputDiv.appendChild(returnedCreateFlashInputs[1]);
            
            cardCount += 1;

            let deletebtn = createButton("delete-card", "DELETE", "button")
            inputDiv.appendChild(deletebtn);

            deletebtn.addEventListener('click', () => {
               // Remove the front input
                inputDiv.removeChild(returnedCreateFlashInputs[0]);
                // Remove the back input
                inputDiv.removeChild(returnedCreateFlashInputs[1]);
                // Remove the delete button itself
                inputDiv.removeChild(deletebtn);

                // Remove the delete button itself
                inputDiv.removeChild(deletebtn);

                cardCount -= 1;
            });
        }

    });

    // === On form submit, store the final number of flashcards ===
    flashForm.addEventListener('submit', function (event) {
        hiddenInputTwo.value = cardCount; // Add 1 because cardCount is 0-based
    });
}

export function createEdit(sandbox) {
    sandbox.innerHTML = '';

    // === Set up UI ===
    let folder_name = ""; // (Optional) to track selected folder if needed

    // Create a form for selecting folders
    const flashForm = document.createElement("form");

    // Main container for the UI
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("flashcard");

    // Container for the dynamic table of folders
    const tableDiv = document.createElement('div');

    // Container for action buttons
    const buttondiv = document.createElement('div');

    // "Choose" button to confirm selected folders
    let choose = createButton("choose", "Choose", "button");

    // Assemble the form UI
    buttondiv.appendChild(choose);
    flashForm.appendChild(tableDiv);      // Will hold the folder selection table
    flashForm.appendChild(buttondiv);     // Holds the "Choose" button
    cardDiv.appendChild(flashForm);       // Add form to card container
    sandbox.appendChild(cardDiv);         // Inject into the page

    // === Fetch available folder options from the backend ===
    retrieve("/flash_card/sendFolders").then(data => {
        const rowAmnt = Object.keys(data).length;

        // Create a 1-column table displaying folder names with checkboxes
        const flashtable = createTable(rowAmnt, 1, data, "folder_name");
        tableDiv.appendChild(flashtable);
    });


    const inputDiv = document.createElement('div'); // Container for flashcard input pairs
    // === Handle folder selection ===
    choose.addEventListener('click', () => {
        // 1. Get all folder checkboxes
        const checkboxes = sandbox.querySelectorAll('input[type="checkbox"]');

        // 2. Filter those that are checked
        const checked = Array.from(checkboxes).filter(box => box.checked);

        // 3. Extract the selected folder names
        const values = checked.map(box => box.value);

        // Remove the folder selection form to make room for next UI
        cardDiv.removeChild(flashForm);

        // === Re-fetch folder data and match selected folders ===
        retrieve("/flash_card/sendFolders")
            .then(function extractIds(data) {
                let folderList = [];

                for (let i = 0; i < Object.keys(data).length; i++) {
                    if (values.includes(data[i].folder_name)) {
                        folderList.push(data[i].folder_name);
                    }
                }

                // Return list of selected folder names
                return folderList;
            })
            .then(function (folderList) {
                // === Now retrieve flashcard sets inside the selected folders ===
                retrieve("/flash_card/listSet", folderList, "folder_list")
                    .then(function tableSet(setList) {
                        // Clear the sandbox to prepare for flashcard set selection
                        sandbox.innerHTML = '';

                        // Create UI containers
                        choose = createButton("choosetwo", "Choose2", "button");
                        buttondiv.appendChild(choose);

                        const setTableContainer = document.createElement('div');
                        const setFormButtonContainer = document.createElement('div');
                        const setSelectionForm = document.createElement('form');
                        const flashcardContainer = document.createElement('div');

                        // Create table of flashcard sets
                        const totalRows = Object.keys(setList).length;
                        const flashcardTable = createTable(totalRows, 1, setList, "set_name");
                        setTableContainer.appendChild(flashcardTable);

                        // Apply styling class
                        flashcardContainer.classList.add("flashcard");

                        // Add final selection button
                        const chooseSetButton = createButton("choose", "Choose", "button");

                        // Assemble UI structure
                        setFormButtonContainer.appendChild(chooseSetButton);
                        setSelectionForm.appendChild(setTableContainer);
                        setSelectionForm.appendChild(setFormButtonContainer);
                        flashcardContainer.appendChild(setSelectionForm);
                        sandbox.appendChild(flashcardContainer);

                        // Return button so we can add listener
                        return [chooseSetButton];
                    })
                    .then(returnArr => {
                        // Add event listener to the final "Choose" button
                        returnArr[0].addEventListener('click', () => {
                            // 1. Get all flashcard set checkboxes
                            const checkboxesFlashSets = sandbox.querySelectorAll('input[type="checkbox"]');

                            // 2. Filter checked sets
                            const checkedFlashSets = Array.from(checkboxesFlashSets).filter(box => box.checked);

                            // 3. Extract set names from checkboxes
                            const valuesFlashSets = checkedFlashSets.map(box => box.value);

                            // === Display the selected flashcard sets ===
                            populateEntries(valuesFlashSets, sandbox);
                        });
                    });
            });
    });
}

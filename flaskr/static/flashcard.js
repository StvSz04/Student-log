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
  deleteFolders,
  createFlashInputs,
  createListnerTools,
  createListeningFunction
} from './flashcardHelpers.js';


const createbtnCard = document.getElementById("create-set");
const createbtnFolder = document.getElementById("create-folder");
const usebtn = document.getElementById("use");
const deletebtn = document.getElementById("delete");

// sanbox correpsonds to the div that all 3 buttons will use to diplay info
let sandbox = document.getElementById("sandbox-div") 



// This event listener initializes the flashcard set creation UI when "Create Set" is clicked
createbtnCard.addEventListener("click", function () {
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
    let returnedCreateListnerTools = createListnerTools(cardCount);

    // Append inputs and tools in order: front input → front tools → back input → back tools
    inputDiv.appendChild(returnedCreateFlashInputs[0]);       // Front input
    inputDiv.appendChild(returnedCreateListnerTools[0]);      // Front start button
    inputDiv.appendChild(returnedCreateListnerTools[1]);      // Front stop button
    inputDiv.appendChild(returnedCreateFlashInputs[1]);       // Back input
    inputDiv.appendChild(returnedCreateListnerTools[2]);      // Back start button
    inputDiv.appendChild(returnedCreateListnerTools[3]);      // Back stop button

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
        // Grab the last input (used to insert the new card after it)
        let lastInput = flashForm.elements[flashForm.elements.length - 3];

        // Increment card count and create new inputs/buttons
        cardCount += 1;
        returnedCreateFlashInputs = createFlashInputs(cardCount);
        returnedCreateListnerTools = createListnerTools(cardCount);

        // Insert front input and associated buttons
        inputDiv.insertBefore(returnedCreateFlashInputs[0], lastInput.nextSibling);
        inputDiv.appendChild(returnedCreateListnerTools[0]);
        inputDiv.appendChild(returnedCreateListnerTools[1]);

        // Insert back input and associated buttons
        inputDiv.appendChild(returnedCreateFlashInputs[1]);
        inputDiv.appendChild(returnedCreateListnerTools[2]);
        inputDiv.appendChild(returnedCreateListnerTools[3]);
    });

    // === On form submit, store the final number of flashcards ===
    flashForm.addEventListener('submit', function (event) {
        hiddenInputTwo.value = cardCount + 1; // Add 1 because cardCount is 0-based
    });
});


// This event listener sets up the UI for creating a new flashcard folder
createbtnFolder.addEventListener("click", function () {

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
});



// ALL event listeners here correspond to **using a flashcard set**
usebtn.addEventListener("click", function () {
    // === Clear any previous content ===
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
                const chooseSetButton = createButton("choose", "Choose3", "button");

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
                // Add event listener to the final "Choose3" button
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
});


// Event listener for deleting flashcard sets or folders
deletebtn.addEventListener("click", function () {
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
});




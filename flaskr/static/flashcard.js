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
  createListeningFunction,
  createSet,
  createFolder,
  creatUsebtn
} from './flashcardHelpers.js';


const createbtnCard = document.getElementById("create-set");
const createbtnFolder = document.getElementById("create-folder");
const usebtn = document.getElementById("use");
const deletebtn = document.getElementById("delete");
const editbtn = document.getElementById('edit');

// sanbox correpsonds to the div that all 3 buttons will use to diplay info
let sandbox = document.getElementById("sandbox-div") 



// This event listener initializes the flashcard set creation UI when "Create Set" is clicked
createbtnCard.addEventListener("click", () => createSet(sandbox));


// This event listener sets up the UI for creating a new flashcard folder
createbtnFolder.addEventListener("click", () => createFolder(sandbox));



// ALL event listeners here correspond to **using a flashcard set**
usebtn.addEventListener("click", () => creatUsebtn(sandbox));


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

// Even listener for edting flashcard sets
editbtn.addEventListener("click", function(){
    createSet(sandbox)
})




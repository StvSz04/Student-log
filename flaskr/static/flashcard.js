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
  creatUsebtn,
  createDeletebtn,
  populateEntries
} from './flashcardHelpers.js';


const createbtnCard = document.getElementById("create-set");
const createbtnFolder = document.getElementById("create-folder");
const usebtn = document.getElementById("use");
const deletebtn = document.getElementById("delete");
// const editbtn = document.getElementById('edit');

// sanbox correpsonds to the div that all 3 buttons will use to diplay info
let sandbox = document.getElementById("sandbox-div") 



// This event listener initializes the flashcard set creation UI when "Create Set" is clicked
createbtnCard.addEventListener("click", () => createSet(sandbox));

// This event listener sets up the UI for creating a new flashcard folder
createbtnFolder.addEventListener("click", () => createFolder(sandbox));

// ALL event listeners here correspond to **using a flashcard set**
usebtn.addEventListener("click", () => creatUsebtn(sandbox));

// Event listener for deleting flashcard sets or folders
deletebtn.addEventListener("click", () => createDeletebtn(sandbox));

// Even listener for edting flashcard sets
// editbtn.addEventListener("click", () => populateEntries(sandbox));




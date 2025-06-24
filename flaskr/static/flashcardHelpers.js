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

    updateBool(){
        this.isFront ? this.isFront = false : this.isFront = true;
    }


}



// This function creates instances of buttons;
export function createButton(id, text,type) {
    const btn = document.createElement("button");
    btn.type = type;
    btn.id = id;
    btn.textContent = text;
    return btn;
}

// This function creates a label
export function createLabel(id,text){
    const flashlabel = document.createElement("label");
    flashlabel.id = id;
    flashlabel.textContent = text; 
    return flashlabel;
}

export function createTable(rowAmnt, colAmnt,data,field) {
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
export async function retrieve(destination,data,string) {
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
export function selectAddOptions(){
    return retrieve('/flash_card/sendFolders');
}

// This funciton sends a request to the backend for user selected flashcards
export async function retrieveFlashcards(destination,data,string){
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

// This function makes a GET request to then display the flashcards
export function displaySets(set_name,sandbox){
    // Define a choose variable to enable swapping between cards
    let count = {value : 0, max : 0};
    let flashcardArr = [];

    retrieveFlashcards("/flash_card/renderCards",set_name,"set_name")
    .then(function generateDeck(data){
        for(let i = 0; i < Object.keys(data).length;i++){
            flashcardArr.push(new Flashcard(data[i].front,data[i].back));
        }
        
        count.max = flashcardArr.length;
    })
    .then(function renderCards(){
            sandbox.innerHTML = ''; // Clear the sandbox
                
            // Add label to display the flashcard text
            let textlabel = createLabel("fliplabel","");
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
                // If true then show back and change bool value to false otherwise do inverse
                flashcardArr[count.value].isFront 
                ? (textlabel.textContent = flashcardArr[count.value].back, flashcardArr[count.value].isFront = false) 
                : (textlabel.textContent = flashcardArr[count.value].front,flashcardArr[count.value].isFront = true);
            }


                // Add newly created card to the sandbox
            sandbox.append(cardDiv);
    });   
}

export function deleteSets(setList){
    return retrieve('/flash_card/deleteSets',setList,"set_name");
}

export function deleteFolders(folderList){
    return retrieve('/flash_card/deleteFolders',folderList,"folder_name");
}

export function createFlashInputs(cardCount){
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

export function createListnerTools(cardCount){
    const frontstartbutton = createButton("front-start " + cardCount, "Start", "button");
    const frontstopbutton = createButton("front-stop "  + cardCount, "Stop", "button");
    const backstartbutton = createButton("back-start " + cardCount, "Start", "button");
    const backstopbutton = createButton("back-stop "  + cardCount, "Stop", "button");

    return [frontstartbutton,frontstopbutton,backstartbutton,backstopbutton];
}
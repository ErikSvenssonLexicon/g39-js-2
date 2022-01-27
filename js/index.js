//State of application
const state = {
    people: [],
    message: null
}

const setErrors = (data) => {
    state.message = data.message;
    document.getElementById("message").innerHTML = state.message;
    if(data.errors){
        updateValidationStatus("birthDate", "birthDate-message", data.errors.birthDate);
        updateValidationStatus("email", "email-message", data.errors.email);
        updateValidationStatus("name", "name-message", data.errors.name);
    }
}

const updateValidationStatus = (inputId, messageId, errors) =>{
    const input = document.getElementById(inputId);
    const message = document.getElementById(messageId);
    if(errors){
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        message.innerHTML = errors.join(", ")        
    }else{
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        message.innerHTML = "";
    }
}

//EVENT HANDLERS
const handleFormSubmit = async (event) => {
    event.preventDefault();
    state.message = null;
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const birthDate = document.getElementById("birthDate");
    const person = {
        name: name.value,
        email: email.value,
        birthDate: birthDate.value,
    }
    await usePost("http://localhost:8080/people", person)
        .then(data => {
            if(data.status >= 400){
                setErrors(data);
            }else{
                state.people = [...state.people, data];
                name.value = "";
                email.value = "";
                birthDate.value = "";
            }
        })
        renderPeople();    
}

const handleRemove = async (tr) => {
    state.message = null;
    await deletePerson(`http://localhost:8080/people/${tr.id}`)
        .then(text => state.message = text)
    state.people = state.people.filter(person => person.id != tr.id);
    document.getElementById("message").innerHTML = state.message;
    renderPeople();
}

//EVENT LISTENERS
document.getElementById("myForm").addEventListener("submit", handleFormSubmit);

//UTIL FUNCTIONS
const personToTableRow = (person) =>{
    return `<tr onclick="handleRemove(this)" id=${person.id}>
        <td>${person.name}</td>    
        <td>${person.email}</td>    
        <td>${person.birthDate}</td>
        <td>${person.age}</td>    
    </tr>`
}

const peopleToTable = () =>{
    const table = createElement("table", "table", "table-hover");
        const tHead = createElement("thead");
        const hHeadRow = 
        `<tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Birth Date</th>
            <th scope="col">Age</th>
        `;
        tHead.innerHTML = hHeadRow;

        const tBody = createElement("tbody");
        const rows = state.people.map(person => personToTableRow(person));
        tBody.innerHTML = rows.join("");

        table.appendChild(tHead);
        table.appendChild(tBody);
        return table;
}

//API
async function deletePerson(url = ""){
    const response = await fetch(url, {
        method: 'DELETE',
        'Content-Type': 'text/plain'
    });
    return response.text();
}

async function fetchAll(url = ""){
    const response = await fetch(url);
    return response.json();
}

async function usePost(url="", data = {}){
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    return response.json();
}

//RENDER FUNCTION(S)
const createElement = (type, ...classes) =>{
    const element = document.createElement(type);
    if(classes.length > 0){
        for(const css of classes){
            element.classList.add(css);
        }
    }
    return element;
}

const renderPeople = () =>{
    const container = document.getElementById("people");
    container.innerHTML = "";

    if(state.people && state.people.length > 0){        
        container.appendChild(
            peopleToTable()
        );                
    }else{
        const paragraph = `<p class="text-center">Please add some people</p>`;
        container.innerHTML = paragraph;
    }    
}

async function initialize(){
    if(state.people.length === 0){
        await fetchAll("http://localhost:8080/people")
            .then(data => {
                state.people = data;
            })
            .catch(error => alert(error))
    }
    renderPeople();
}

initialize();



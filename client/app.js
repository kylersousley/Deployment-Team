console.log("connected")

const rollercoasters_div = document.querySelector("#rollercoasters")
let editID = null

function load() {
    rollercoasters_div.innerHTML = ""
    reset_form()

    fetch("http://localhost:5000/rollercoasters")
        .then(function (response) {
            response.json()
                .then(function (data) {
                    console.log(data)
                    data.forEach(rollercoaster => load_rollercoasters(rollercoaster))
                })
        })
}

function reset_form() {
    document.querySelector('#input_coaster_name').value = ""
    document.querySelector('#input_coaster_manufacturer').value = ""
    document.querySelector('#input_coaster_type').value = ""
    document.querySelector('#input_coaster_description').value = ""
    document.querySelector('#input_coaster_rating').value = ""

    document.querySelector('#input_submit').innerHTML = "Submit"
}

function load_rollercoasters(rollercoaster) {
    let delButton = document.createElement("img")
    delButton.src = '../icons/trash-can.svg'
    delButton.onclick = function () {
        do_delete(rollercoaster.id)
    }
    delButton.classList.add("delButton")

    let div = document.createElement("div")
    let h3 = document.createElement("h3")
    let p = document.createElement("p")
    let p2 = document.createElement("p")
    let p3 = document.createElement("p")
    let p4 = document.createElement("p")

    div.classList.add("coaster_card")
    p.classList.add("coaster_info")
    p2.classList.add("coaster_info")
    p3.classList.add("coaster_info")
    p4.classList.add("coaster_info")

    let editButton = document.createElement("img")
    editButton.src = '../icons/edit-square.svg'
    editButton.onclick = function () {
        do_edit(rollercoaster, h3, p, p2, p3, p4)
    }
    editButton.classList.add("editButton")

    rollercoasters_div.append(div)
    div.append(delButton)
    div.append(editButton)
    div.append(h3)
    div.append(p)
    div.append(p2)
    div.append(p3)
    div.append(p4)

    h3.innerHTML = rollercoaster.name
    p.innerHTML = "Manufacturer: " + rollercoaster.manufacturer
    p2.innerHTML = "Type: " + rollercoaster.type
    p3.innerHTML = "Description: " + rollercoaster.description
    p4.innerHTML = "Rating: " + rollercoaster.rating

    add_hidden_edit_input(div, rollercoaster)
}

function do_delete(id) {
    let decision = confirm("Are you sure?")
    if (decision == false) {
        return
    }

    fetch("http://localhost:5000/rollercoasters/" + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(function (response) {
        console.log("Deleted")
        load()
    })
}

function add_hidden_edit_input(div, rollercoaster) {
    let rollercoaster_name = rollercoaster.name.replaceAll(' ', '_')
    
    let name_feild = document.createElement("input")
    name_feild.classList.add("edit_box")
    name_feild.classList.add("hidden")
    name_feild.id = "name_" + rollercoaster_name
    name_feild.type = "text"
    name_feild.setAttribute('required', '')

    let manufacturer_feild = document.createElement("input")
    manufacturer_feild.classList.add("edit_box")
    manufacturer_feild.classList.add("hidden")
    manufacturer_feild.id = "manufacturer_" + rollercoaster_name
    manufacturer_feild.type = "text"
    manufacturer_feild.setAttribute('required', '')

    let type_feild = document.createElement("input")
    type_feild.classList.add("edit_box")
    type_feild.classList.add("hidden")
    type_feild.id = "type_" + rollercoaster_name
    type_feild.type = "text"
    type_feild.setAttribute('required', '')

    let description_feild = document.createElement("textarea")
    description_feild.classList.add("edit_box")
    description_feild.classList.add("hidden")
    description_feild.id = "description_" + rollercoaster_name
    description_feild.type = "text"
    description_feild.setAttribute('required', '')

    let rating_feild = document.createElement("input")
    rating_feild.classList.add("edit_box")
    rating_feild.classList.add("hidden")
    rating_feild.id = "rating_" + rollercoaster_name
    rating_feild.type = "text"
    rating_feild.setAttribute('required', '')

    let saveButton = document.createElement("button")
    saveButton.classList.add("hidden")
    saveButton.classList.add("edit_submit")
    saveButton.id = "save_button_" + rollercoaster_name

    div.append(name_feild)
    div.append(manufacturer_feild)
    div.append(type_feild)
    div.append(description_feild)
    div.append(rating_feild)
    div.append(saveButton)
}

function do_edit(rollercoaster, h3, p, p2, p3, p4) {
    editID = rollercoaster.id
    console.log("You are going to edit: ", rollercoaster)
    h3.classList.toggle("hidden")
    p.classList.toggle("hidden")
    p2.classList.toggle("hidden")
    p3.classList.toggle("hidden")
    p4.classList.toggle("hidden")

    let rollercoaster_name = rollercoaster.name.replaceAll(' ', '_')
    let name = document.querySelector("#name_" + rollercoaster_name)
    let manufacturer = document.querySelector("#manufacturer_" + rollercoaster_name)
    let type = document.querySelector("#type_" + rollercoaster_name)
    let description = document.querySelector("#description_" + rollercoaster_name)
    let rating = document.querySelector("#rating_" + rollercoaster_name)
    let saveButton = document.querySelector("#save_button_" + rollercoaster_name)

    name.classList.toggle("hidden")
    manufacturer.classList.toggle("hidden")
    type.classList.toggle("hidden")
    description.classList.toggle("hidden")
    rating.classList.toggle("hidden")
    saveButton.classList.toggle("hidden")

    name.value = rollercoaster.name
    manufacturer.value = rollercoaster.manufacturer
    type.value = rollercoaster.type
    description.value = rollercoaster.description
    rating.value = rollercoaster.rating
    saveButton.innerHTML = "SAVE"

    name.style.gridRow = '2 / 3'
    manufacturer.style.gridRow = '3 / 4'
    type.style.gridRow = '4 / 5'
    description.style.gridRow = '5 / 6'
    rating.style.gridRow = '6 / 7'
    saveButton.style.gridRow = '7 / 8'

    console.log(saveButton)
    saveButton.onclick = function () {
        editRollercoaster(rollercoaster)
    }
}

function checkInputFeilds(name, manufacturer, type, description, rating) {
    let decision = true
    if (!name) {
        let name_feild = document.querySelector("#input_coaster_name")
        name_feild.style.borderColor = "#CF0000"
        decision = false
    }
    if (!manufacturer) {
        let manufacturer_feild = document.querySelector("#input_coaster_manufacturer")
        manufacturer_feild.style.borderColor = "#CF0000"
        decision = false
    }
    if (!type) {
        let type_feild = document.querySelector("#input_coaster_type")
        type_feild.style.borderColor = "#CF0000"
        decision = false
    }
    if (!description) {
        let description_feild = document.querySelector("#input_coaster_description")
        description_feild.style.borderColor = "#CF0000"
        decision = false
    }
    if (!rating) {
        let rating_feild = document.querySelector("#input_coaster_rating")
        rating_feild.style.borderColor = "#CF0000"
        decision = false
    }
    return decision
}

function addNewRollercoaster() {
    //get the form data
    let name = document.querySelector("#input_coaster_name").value
    let manufacturer = document.querySelector("#input_coaster_manufacturer").value
    let type = document.querySelector("#input_coaster_type").value
    let description = document.querySelector("#input_coaster_description").value
    let rating = document.querySelector("#input_coaster_rating").value

    if (!checkInputFeilds(name, manufacturer, type, description, rating)) {
        return
    }  

    let name_feild = document.querySelector("#input_coaster_name")
    name_feild.style.borderColor = "#92a4b2"
    let manufacturer_feild = document.querySelector("#input_coaster_manufacturer")
    manufacturer_feild.style.borderColor = "#92a4b2"
    let type_feild = document.querySelector("#input_coaster_type")
    type_feild.style.borderColor = "#92a4b2"
    let description_feild = document.querySelector("#input_coaster_description")
    description_feild.style.borderColor = "#92a4b2"
    let rating_feild = document.querySelector("#input_coaster_rating")
    rating_feild.style.borderColor = "#92a4b2"

    //get it ready to send to api
    let rollercoaster_data = "name=" + encodeURIComponent(name)
    rollercoaster_data += "&manufacturer=" + encodeURIComponent(manufacturer)
    rollercoaster_data += "&type=" + encodeURIComponent(type)
    rollercoaster_data += "&description=" + encodeURIComponent(description)
    rollercoaster_data += "&rating=" + encodeURIComponent(rating)
    console.log(rollercoaster_data)

    //send to api
    let url = "http://localhost:5000/rollercoasters"
    fetch(url, {
        method: "POST",
        body: rollercoaster_data,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(function (response) {
        console.log("saved")
        load()
    })
}

function editRollercoaster(rollercoaster) {
    let rollercoaster_name = rollercoaster.name.replaceAll(' ', '_')
    let name = document.querySelector("#name_" + rollercoaster_name).value
    let manufacturer = document.querySelector("#manufacturer_" + rollercoaster_name).value
    let type = document.querySelector("#type_" + rollercoaster_name).value
    let description = document.querySelector("#description_" + rollercoaster_name).value
    let rating = document.querySelector("#rating_" + rollercoaster_name).value

    let rollercoaster_data = "name=" + encodeURIComponent(name)
    rollercoaster_data += "&manufacturer=" + encodeURIComponent(manufacturer)
    rollercoaster_data += "&type=" + encodeURIComponent(type)
    rollercoaster_data += "&description=" + encodeURIComponent(description)
    rollercoaster_data += "&rating=" + encodeURIComponent(rating)
    console.log(rollercoaster_data)

    let url = "http://localhost:5000/rollercoasters/" + rollercoaster.id
    fetch(url, {
        method: "PUT",
        body: rollercoaster_data,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(function (response) {
        console.log("Edited")
        load()
    })
    
}

let formButton = document.querySelector("h1")
formButton.onclick = function () {
    let form = document.querySelector("form")
    form.classList.toggle("hidden")
}

let button = document.querySelector("#input_submit")
button.onclick = addNewRollercoaster

load()
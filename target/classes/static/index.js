const taskContainer = document.getElementById("TaskContainer")
const listBackground = document.getElementById("Background")
const taskTemplate = document.getElementById("taskTemplate")
const taskCounter = document.getElementById("taskCounter")
const addButton = document.getElementById("AddButton")
const creatorTemplate = document.getElementById("creatorTemplate")
const colors = ["#180161", "#4F1787","#EB3678","#FB773C"]
let mode = "none"

let currentColor = 0

function generateTaskColor() {
    if (currentColor > colors.length - 1) currentColor = 0
    const color = colors[currentColor]  
    currentColor += 1
    return color
}


function enterTaskCreator(element) {
    mode = "taskCreator"
    console.log(creatorTemplate)
    const creator = creatorTemplate.cloneNode(true)
    listBackground.classList.add("taskFormBlur")
    document.body.appendChild(creator)
}

addButton.addEventListener("click", enterTaskCreator);

function addTask(title = "None",description = "None",date = "None") {
    const color = generateTaskColor()
    const clonedTemplate = taskTemplate.content.cloneNode(true)
    const frame = clonedTemplate.children["frame"]
    const titleElement = frame.children["title"]
    const descElement = frame.children["description"]
    const dateElement = frame.children["deadline"]
    titleElement.innerHTML = title
    descElement.innerHTML = description
    dateElement.innerHTML = date
    dateElement.style.fontSize = "10px"

    frame.style.backgroundColor = color
    frame.style.backgroundImage = `linear-gradient(-150deg, ${color} 50%,rgb(1,1,1,50%))`
    taskContainer.appendChild(clonedTemplate)
}

async function getTasks() {
    const response = await fetch("/tasks")
    return await response.json()
}

async function updateTaskCount() {
    const tasks = await getTasks()
    taskCounter.innerHTML = tasks.length
}

async function updateTaskList() {
    const tasks = await getTasks()
    tasks.forEach(task => {
        const date = new Date(task.deadline)
        addTask(task.title,task.description,date.toUTCString().replaceAll(":00 GMT",""))
    });
}

updateTaskList()
updateTaskCount()

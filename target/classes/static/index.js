
const taskContainer = document.getElementById("taskContainer")
const taskTemplate = document.getElementById("taskTemplate")
const taskCounter = document.getElementById("taskCounter")
const addButton = document.getElementById("taskAddButton")
const creatorTemplate = document.getElementById("creatorTemplate")
const mainFrame = document.getElementById("mainFrame")
const bin = document.getElementById("taskBin")

const properties = document.getElementById("propertiesTab")
const propHeader = document.getElementById("properties_header")

const editButton = document.getElementById("propEdit")

const colors = ["#30C1FF", "#A750FF","#EB3678","#FB773C"]
let mode = "none"

async function getTasks() {
    const response = await fetch("/tasks")
    return await response.json()
}

async function getTask(id) {
    const response = await fetch(`/tasks/${id}`)
    return await response.json()
}

async function saveTask(title,desc,deadline) {
    return await fetch(`/tasks?title=${title}&description=${desc}&deadline=${deadline}`, {method: "POST"})
}

async function removeTask(id) {
    const response = await fetch(`/tasks/${id}`, {method:"DELETE"})
    if (await response) removeTaskUI(id)
    selectedTasks.splice(selectedTasks.indexOf(findSelectedTaskById(id)),1)
    updateTaskCount()
    updateTaskColors()
    return response.json();
}

async function updateTaskCount() {
    const tasks = await getTasks()
    taskCounter.innerHTML = tasks.length || "0"
}

async function updateTaskList() {
    const tasks = await getTasks()
    tasks.forEach(task => {
        createTaskUI(task)
    });
}

async function updateTask(task) {
    const form = document.forms["properties"]
    const date = new Date()
    const title = form["title"].value.toUpperCase()
    const desc = form["desc"].value
    // const minute = clamp(Number(form["minute"].value),0,59)
    // const hour = clamp(Number(form["hour"].value),0,23)
    // const day = clamp(Number)
    // const month = clamp(Number(form["month"].value),0,12)
    // const year =  form["year"].value
    // date.setFullYear(year,month,)
    try {
        const response = await fetch(`/tasks/${task.id}/edit?title=${title}&description=${desc}&deadline=${date}`, {method:"PATCH"})
        if (response) {
            const frame = getTaskFrame(task.id)
            const background = frame.children["background"]
            background.children["title"].innerHTML = title
            background.children["description"].innerHTML = desc
            // background.children["deadline"].innerHTML = formatDate(date)
        }
    } catch (error) {
        console.error(`Incorrect request: ${error}`)
    } 
    return false
}


async function taskCreatorSave(saveButton) { 
    const form = saveButton.parentNode

    const title = !form.title.value ? "NONE" : form.title.value.toUpperCase()
    const desc = !form.desc.value ? "None" : form.desc.value 
    const year = form.year.value || 1970
    const month = Number(form.month.value) || 0
    const day = Number(form.day.value) || 1
    const hour = Number(form.hour.value) || 0
    const minute = Number(form.minute.value) || 0
    const date = new Date()
    date.setUTCFullYear(year,month,day)
    date.setUTCHours(hour,minute,0)

    const response = await saveTask(title,desc,date)
    const task = await response.json()
    updateTaskCount()
    createTaskUI(task)
    updateTaskColors()
    leaveTaskCreator(saveButton.parentNode)
    selectTask(task,true)

}

async function taskFrameClicked(e,taskFrame) {
    const id = taskFrame.id.split("-")[1]
    const task = await getTask(id)
    const holdingShift = e.shiftKey
    if (holdingShift) {
        selectTask(task,false)
    } else {
        selectTask(task,true)
    }

}

function clamp(num, min, max) {
    return num <= min 
      ? min 
      : num >= max 
        ? max 
        : num
}

function taskContainerClicked(e,container) {
    if (e.target == container) {
        clearSelectedTasks()
    }
}

let selectedTasks = []

function findSelectedTaskById(id) {
    let foundTask = null
    selectedTasks.forEach((value) => {
        if (value.id === id) return foundTask = value
    })
    return foundTask
}

function getTaskFrame(id) {
    return document.getElementById(`task-${id}`)
}

function removeSelectedTasks() {
    leaveProperties()
    selectedTasks.forEach((task) => {
        removeTask(task.id)
    })
}

function removePropFilter() {
    properties.classList.remove("properties--unselected")
}

function addPropFilter() {
    properties.classList.add("properties--unselected")
}


function enterProperties() {
    const task = selectedTasks[0]
    const form = document.forms["properties"]
    const deadline = new Date(task.deadline)
    propHeader.innerHTML = `${task.title} (id:${task.id})`
    form["title"].value = task.title
    form["desc"].value = task.description
    form["minute"].value = ("0" + deadline.getDay()).slice(-2)
    form["hour"].value = ("0" + deadline.getHours()).slice(-2)
    form["day"].value = ("0" + (deadline.getDay() + 1)).slice(-2);
    form["month"].value = ("0" + deadline.getMonth()).slice(-2);
    form["year"].value = deadline.getFullYear()
    properties.classList.contains("properties--unselected") ? removePropFilter() : addPropFilter()
    setTimeout(() => {if (properties.classList.contains("properties--unselected") && selectedTasks.length > 0) removePropFilter()},125)

}

function leaveProperties() {
    addPropFilter()
}

function selectTask(task,clearArray) { 
    const length = selectedTasks.length
    const foundTask = findSelectedTaskById(task.id)
    const taskFrame = document.getElementById(`task-${task.id}`)
    if (!foundTask) {
        if (clearArray) clearSelectedTasks(task.id)
        selectedTasks.push(task)
        addSelectedTaskStyle(taskFrame)
        enterProperties()
    } else {
        if (clearArray) {
            if (length > 1) {
                clearSelectedTasks(task.id)
            } else {
                deselectTask(task)
                leaveProperties()
            }
        } else {
            deselectTask(task)
            if (selectedTasks.length <= 0) leaveProperties();
        }

    }
}

function deselectTask(task) {
    const foundTask = findSelectedTaskById(task.id)
    const index = selectedTasks.indexOf(foundTask)
    selectedTasks.splice(index,1)
    const taskFrame = getTaskFrame(task.id)
    removeSelectedTaskStyle(taskFrame)
}

function clearSelectedTasks(exceptionId) {
    const exceptionTask = findSelectedTaskById(exceptionId)
    selectedTasks.forEach((task) =>  {
        const frame = getTaskFrame(task.id)
        if (task.id != exceptionId) {removeSelectedTaskStyle(frame)}
    })
    exceptionTask ? selectedTasks = [exceptionTask] : selectedTasks = []; 
    if (!exceptionTask) leaveProperties();
}

function addSelectedTaskStyle(taskFrame) {
    taskFrame.classList.add("taskFrame--selected")
}

function removeSelectedTaskStyle(taskFrame) {
    taskFrame.classList.remove("taskFrame--selected")
}

function formatDate(date) {
    return date.toUTCString().replaceAll(":00 GMT","")
}

function updateTaskColors() {
    let index = 1;
    for (const element of taskContainer.children) {
        if (element.id != "taskAddButton") {
            index < colors.length ? index ++ : index = 1
            const color = colors[index - 1]
            const background = element.children["background"]
            const titleElement = background.children["title"]
            const descElement = background.children["description"]
            const dateElement = background.children["deadline"]
            const titleLine = background.children["titleLine"]
            const dateLine = background.children["dateLine"]
    
            titleElement.style.color = color
            background.style.borderColor = color
            titleLine.style.borderColor = color
            dateLine.style.borderColor = color
            dateElement.style.color = color
            descElement.style.color = color
        }
    }
}

function enterTaskCreator() {
    if (mode == "none") {
        mode = "taskCreator"
        const taskCreator = creatorTemplate.content.cloneNode(true)
        mainFrame.appendChild(taskCreator)
    }

}

function leaveTaskCreator(button) {
    const creator = button.parentNode
    creator.remove()
    mode = "none"
}

function reactToMouse(event,main,interaction) {
    const background = main.children["background"]
    const gradient = background.children["mouseGradient"]
    const rect = background.getBoundingClientRect()
    const x = event.clientX - (rect.left + rect.width / 2)
    const y = event.clientY - (rect.top + rect.height / 2) 

    switch (interaction) {
        case "moving":
            background.style.transform = `rotateX(${-y / 7}deg) rotateY(${x / 7}deg)`
            if (gradient.style.display != "block") gradient.style.display = "block" 
            if (background.style.transition != "transform 0.1s") background.style.transition = "transform 0.1s"

            const color = background.style.borderColor
            const transformedColor = color
            .replace("rgb(","")
            .replace(")","")
            .split(",")
            const r = transformedColor[0]
            const g = transformedColor[1]
            const b = transformedColor[2]

            const gradientRect = gradient.getBoundingClientRect()
            const x2 = event.clientX - (gradientRect.left)
            const y2 = event.clientY - (gradientRect.top)
            gradient.style.background = `radial-gradient(at ${x2}px ${y2}px,rgb(${r},${g},${b},5%), rgb(0,0,0, 0%) 50%)`;
            break

        case "leaving":
            gradient.style.display = "none" 
            background.style.transition = "transform 0.5s"
            background.style.transform = `rotateX(0deg) rotateY(0deg)`
            break
    }

}

function createTaskUI(task) {
    const clonedTemplate = taskTemplate.content.cloneNode(true)
    const frame = clonedTemplate.children["frame"]
    frame.id = `task-${task.id}`
    const background = frame.children["background"]
    const titleElement = background.children["title"]
    const descElement = background.children["description"]
    const dateElement = background.children["deadline"]

    const date = new Date(task.deadline)
    dateElement.innerHTML = formatDate(date)
    titleElement.innerHTML = task.title 
    descElement.innerHTML = task.description
    dateElement.style.fontSize = "10px"
    taskContainer.appendChild(clonedTemplate)

    frame.addEventListener("mousemove", (e) => {reactToMouse(e,frame,"moving")});
    frame.addEventListener("mouseleave", (e) => {reactToMouse(e,frame,"leaving")});
    frame.addEventListener("click", (e) => {taskFrameClicked(e,frame)})
}

function removeTaskUI(id) {
    const frame = getTaskFrame(id)
    if (frame) frame.remove()
}

bin.addEventListener("click", removeSelectedTasks)
addButton.addEventListener("click", enterTaskCreator);
taskContainer.addEventListener("click", (e) => taskContainerClicked(e,taskContainer))
editButton.addEventListener("click", (e) => {updateTask(selectedTasks[0])})

updateTaskList().then(updateTaskColors)
updateTaskCount()

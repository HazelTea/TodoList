
const taskContainer = document.getElementById("taskContainer")
const taskTemplate = document.getElementById("taskTemplate")
const taskCounter = document.getElementById("taskCounter")
const addButton = document.getElementById("taskAddButton")
const creatorTemplate = document.getElementById("creatorTemplate")
const mainFrame = document.getElementById("mainFrame")
const bin = document.getElementById("taskBin")

const properties = document.getElementById("propertiesTab")
const propHeader = document.getElementById("properties_header")
const propTitle = document.getElementById("properties_title")
const propDesc = document.getElementById("properties_desc")

const propMinute = document.getElementById("properties_deadline_minute")
const propHour = document.getElementById("properties_deadline_hour")
const propMonth = document.getElementById("properties_deadline_month")
const propDay = document.getElementById("properties_deadline_day")
const propYear = document.getElementById("properties_deadline_year")

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
        addTaskUI(task)
    });
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
    date.setFullYear(year,month,day)
    date.setHours(hour,minute,0)

    const response = await saveTask(title,desc,date)
    const task = await response.json()
    updateTaskCount()
    addTaskUI(task)
    updateTaskColors()
    leaveTaskCreator(saveButton.parentNode)

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

async function updateTask(task,getTask) {

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
     
    if (selectedTasks.length > 0) {
        console.log("deez")
        const task = selectedTasks[0]
        propHeader.innerHTML = `${task.title} (id:${task.id})`
        propTitle.value = task.title
        propDesc.value = task.description
        const deadline = new Date(task.deadline)
        propMinute.value = ("0" + deadline.getMinutes()).slice(-2);
        propHour.value = ("0" + deadline.getHours()).slice(-2);
        propDay.value = ("0" + deadline.getDay()).slice(-2);
        propMonth.value = ("0" + deadline.getMonth()).slice(-2);
        propYear.value = deadline.getFullYear()
        properties.classList.contains("properties--unselected") ? removePropFilter() : addPropFilter()
        setTimeout(() => {if (properties.classList.contains("properties--unselected") && selectedTasks.length > 0) removePropFilter()},125)
    } else if (selectedTasks.length > 1) {
        return
    }

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
        if (task.id != exceptionId) deselectTask(task)
    })
    exceptionTask ? selectedTasks = [exceptionTask] : selectedTasks = []; 
    if (!exceptionId) leaveProperties();
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

function addTaskUI(task) {
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
    console.log(date.getMonth())

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
taskContainer.addEventListener("click", (e) => {taskContainerClicked(e,taskContainer)})

updateTaskList().then(updateTaskColors)
updateTaskCount()


const taskContainer = document.getElementById("TaskContainer")
const listBackground = document.getElementById("Background")
const taskTemplate = document.getElementById("taskTemplate")
const taskCounter = document.getElementById("taskCounter")
const addButton = document.getElementById("AddButton")
const creatorTemplate = document.getElementById("creatorTemplate")

const colors = ["#180161", "#4F1787","#EB3678","#FB773C"]
let mode = "none"

let currentColor = 0

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

let selectedTasks = []

function findSelectedTaskById(id) {
    let foundTask = null
    selectedTasks.forEach((value) => {
        if (value.id === id) return foundTask = value
    })
    return foundTask
}

function selectTask(task,clearArray) { 
    const length = selectedTasks.length
    const foundTask = findSelectedTaskById(task.id)
    if (clearArray) deselectAllTasks(task.id)
    if (!foundTask) {
        selectedTasks.push(task)
        const taskFrame = document.getElementById(`task-${task.id}`)
        addSelectedTaskStyle(taskFrame)
        if (clearArray) deselectAllTasks(task.id)

    } else if (foundTask && length <= 1) {
        deselectTask(task)
    }  else if (foundTask && length > 1) {
        deselectAllTasks(task.id)
    }

}

function deselectTask(task) {
    const foundTask = findSelectedTaskById(task.id)
    const index = selectedTasks.indexOf(foundTask)
    selectedTasks.splice(index,1)
    const taskFrame = document.getElementById(`task-${task.id}`)
    removeSelectedTaskStyle(taskFrame)
}

function deselectAllTasks(exceptionId) {
    selectedTasks.forEach((task) => {
        if (exceptionId != task.id) {
            deselectTask(task)
        }
    })
}

function addSelectedTaskStyle(taskFrame) {
    taskFrame.classList.add("taskFrame_selected")
}

function removeSelectedTaskStyle(taskFrame) {
    taskFrame.classList.remove("taskFrame_selected")
}

function formatDate(date) {
    return date.toUTCString().replaceAll(":00 GMT","")
}

function generateTaskColor() {
    if (currentColor > colors.length - 1) currentColor = 0
    const color = colors[currentColor]  
    currentColor += 1
    return color
}

function enterTaskCreator() {
    if (mode == "none") {
        mode = "taskCreator"
        listBackground.classList.add("taskFormBlur")
        const taskCreator = creatorTemplate.content.cloneNode(true)
        document.body.appendChild(taskCreator)
    }

}

function leaveTaskCreator(button) {
    const creator = button.parentNode
    listBackground.classList.remove("taskFormBlur")
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
            background.style.transform = `rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`
            if (gradient.style.display != "block") gradient.style.display = "block" 
            if (background.style.transition != "transform 0.1s") background.style.transition = "transform 0.1s"

            const gradientRect = gradient.getBoundingClientRect()
            const x2 = event.clientX - (gradientRect.left)
            const y2 = event.clientY - (gradientRect.top)
            gradient.style.background = `radial-gradient(at ${x2}px ${y2}px,rgb(0,0,0,15%), rgb(0,0,0, 0%) 25%)`;
            break

        case "leaving":
            gradient.style.display = "none" 
            background.style.transition = "transform 0.5s"
            background.style.transform = `rotateX(0deg) rotateY(0deg)`
            break
    }

}

function addTaskUI(task) {
    const color = generateTaskColor()
    const clonedTemplate = taskTemplate.content.cloneNode(true)
    const frame = clonedTemplate.children["frame"]
    frame.id = `task-${task.id}`
    const background = frame.children["background"]
    const titleElement = background.children["title"]
    const descElement = background.children["description"]
    const dateElement = background.children["deadline"]
    titleElement.innerHTML = task.title 
    descElement.innerHTML = task.description
    const date = new Date(task.deadline)
    dateElement.innerHTML = formatDate(date)
    dateElement.style.fontSize = "10px"

    background.style.backgroundColor = color
    background.style.backgroundImage = `linear-gradient(-150deg, ${color} 50%,rgb(1,1,1,50%))`
    taskContainer.appendChild(clonedTemplate)

    frame.addEventListener("mousemove", (e) => {reactToMouse(e,frame,"moving")});
    frame.addEventListener("mouseleave", (e) => {reactToMouse(e,frame,"leaving")});
    frame.addEventListener("click", (e) => {taskFrameClicked(e,frame)})
}

addButton.addEventListener("click", enterTaskCreator);

updateTaskList()
updateTaskCount()


const taskContainer = document.getElementById("taskContainer")
// const listBackground = document.getElementById("Background")
const taskTemplate = document.getElementById("taskTemplate")
const taskCounter = document.getElementById("taskCounter")
const addButton = document.getElementById("taskAddButton")
const creatorTemplate = document.getElementById("creatorTemplate")

const colors = ["#30C1FF", "#A750FF","#EB3678","#FB773C"]
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

function selectTask(task,clearArray) { 
    const length = selectedTasks.length
    const foundTask = findSelectedTaskById(task.id)
    const taskFrame = document.getElementById(`task-${task.id}`)
    if (!foundTask) {
        selectedTasks.push(task)
        addSelectedTaskStyle(taskFrame)
        if (clearArray) clearSelectedTasks(task.id)
    } else {
        if (clearArray) {
            if (length > 1) {
                clearSelectedTasks(task.id)
            } else {
                deselectTask(task)
            }
        } else {
            deselectTask(task)
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
    const task = findSelectedTaskById(exceptionId)
    selectedTasks.forEach((task) =>  {
        if (task.id != exceptionId) removeSelectedTaskStyle(getTaskFrame(task.id))
    })
    task ? selectedTasks = [task] : selectedTasks = []
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

function generateTaskColor() {
    if (currentColor > colors.length - 1) currentColor = 0
    const color = colors[currentColor]  
    currentColor += 1
    return color
}

function enterTaskCreator() {
    if (mode == "none") {
        mode = "taskCreator"
        // listBackground.classList.add("taskFormBlur")
        const taskCreator = creatorTemplate.content.cloneNode(true)
        document.body.appendChild(taskCreator)
    }

}

function leaveTaskCreator(button) {
    const creator = button.parentNode
    // listBackground.classList.remove("taskFormBlur")
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
    const titleLine = background.children["titleLine"]
    const dateLine = background.children["dateLine"]
    titleElement.innerHTML = task.title 
    descElement.innerHTML = task.description

    const date = new Date(task.deadline)
    dateElement.innerHTML = formatDate(date)
    dateElement.style.fontSize = "10px"

    titleElement.style.color = color
    background.style.borderColor = color
    titleLine.style.borderColor = color
    dateLine.style.borderColor = color
    dateElement.style.color = color
    descElement.style.color = color
    taskContainer.appendChild(clonedTemplate)

    frame.addEventListener("mousemove", (e) => {reactToMouse(e,frame,"moving")});
    frame.addEventListener("mouseleave", (e) => {reactToMouse(e,frame,"leaving")});
    frame.addEventListener("click", (e) => {taskFrameClicked(e,frame)})
}

addButton.addEventListener("click", enterTaskCreator);
taskContainer.addEventListener("click", (e) => {taskContainerClicked(e,taskContainer)})

updateTaskList()
updateTaskCount()

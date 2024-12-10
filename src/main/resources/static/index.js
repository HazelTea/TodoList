
const taskContainer = document.getElementById("TaskContainer")
const listBackground = document.getElementById("Background")
const taskTemplate = document.getElementById("taskTemplate")
const taskCounter = document.getElementById("taskCounter")
const addButton = document.getElementById("AddButton")
const creatorTemplate = document.getElementById("creatorTemplate")

const colors = ["#180161", "#4F1787","#EB3678","#FB773C"]
let mode = "none"

let currentColor = 0

function formatDate(date) {
    return date.toUTCString().replaceAll(":00 GMT","")
}

var id = null;
function animate(element,x,destX,y,destY) {
  clearInterval(id);
  id = setInterval(frame, 10);
  function frame() {
    if (x == destX && y == destY) {
      clearInterval(id);
    } else {
      x += Math.sign(destX)
      y += Math.sign(destY)
      element.style.top = pos + 'px';
      element.style.left = pos + 'px';
    }
  }
}

let startingAnim = false
function reactToMouse(event,main,interaction) {
    const background = main.children["background"]
    const gradient = background.children["mouseGradient"]
    const rect = background.getBoundingClientRect()
    const x = event.clientX - (rect.left + rect.width / 2)
    const y = event.clientY - (rect.top + rect.height / 2)

    if (interaction=="moving" && !startingAnim) {
        gradient.style.display = "block" 
        background.style.perspective = "500px"
        background.style.transform = `rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`
        background.style.transition = "transform 0s"
        const gradientRect = gradient.getBoundingClientRect()
        const x2 = event.clientX - (rect.left + gradientRect.width / 2)
        const y2 = event.clientY - (rect.top + gradientRect.height / 2)
        gradient.style.left = x2 + "px"
        gradient.style.top = y2 + "px"

    } else if (interaction=="leaving") {
        gradient.style.display = "none" 
        background.style.transition = "transform 0.5s"
        background.style.transform = `rotateX(0deg) rotateY(0deg)`
    }

}

function generateTaskColor() {
    if (currentColor > colors.length - 1) currentColor = 0
    const color = colors[currentColor]  
    currentColor += 1
    return color
}

let selectedTask = null

function selectTaskElement(task) {

}

function deselectElement(task) {

}

function enterTaskCreator() {
    if (mode == "none") {
        mode = "taskCreator"
        listBackground.classList.add("taskFormBlur")
        const taskCreator = creatorTemplate.content.cloneNode(true)
        document.body.appendChild(taskCreator)
    }

}

async function taskCreatorSave(saveButton) { 
    const form = saveButton.parentNode

    const title = form.title.value == "" ? "None" : form.title.value 
    const desc = form.desc.value == "" ? "None" : form.desc.value 
    const year = form.year.value || "1970"
    const month = form.month.value || "01"
    const day = form.day.value || "01"
    const hour = form.hour.value || "00"
    const minute = form.minute.value || "00"
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`)
    await saveTask(title,desc,date)
    updateTaskCount()
    addTaskUI(title,desc,formatDate(date))
    leaveTaskCreator(saveButton.parentNode)

}

function leaveTaskCreator(button) {
    const creator = button.parentNode
    listBackground.classList.remove("taskFormBlur")
    creator.remove()
    mode = "none"
}

addButton.addEventListener("click", enterTaskCreator);

function addTaskUI(title = "None",description = "None",date = "None") {
    const color = generateTaskColor()
    const clonedTemplate = taskTemplate.content.cloneNode(true)
    const frame = clonedTemplate.children["frame"]
    const background = frame.children["background"]
    const titleElement = background.children["title"]
    const descElement = background.children["description"]
    const dateElement = background.children["deadline"]
    titleElement.innerHTML = title
    descElement.innerHTML = description
    dateElement.innerHTML = date
    dateElement.style.fontSize = "10px"

    background.style.backgroundColor = color
    background.style.backgroundImage = `linear-gradient(-150deg, ${color} 50%,rgb(1,1,1,50%))`
    taskContainer.appendChild(clonedTemplate)
}

async function getTasks() {
    const response = await fetch("/tasks")
    return await response.json()
}

async function saveTask(title,desc,deadline) {
    console.log(title,desc,deadline)
    return await fetch(`/tasks?title=${title}&description=${desc}&deadline=${deadline}`, {method: "POST"})
}

async function updateTaskCount() {
    const tasks = await getTasks()
    console.log(tasks.length)
    taskCounter.innerHTML = tasks.length || "0"
}

async function updateTaskList() {
    const tasks = await getTasks()
    tasks.forEach(task => {
        const title = !task.title ? "None" : task.title
        const desc = !task.description ? "None" : task.description
        const date = new Date(task.deadline)
        addTaskUI(title,desc,formatDate(date))
    });
}

updateTaskList()
updateTaskCount()

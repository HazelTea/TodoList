const baller = document.getElementById("test")
// do {
    async function deez() {
        const thingy = await fetch("http://localhost:8080/test")
        const textrequest = thingy.text()
        textrequest.then(data => {console.log(data)})
        // console.log(await JSON.stringify(thingy.text))
    }

    deez()

// }while (true);
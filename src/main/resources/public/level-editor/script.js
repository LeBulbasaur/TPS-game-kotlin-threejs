const board = document.getElementById("board")
const options = document.querySelectorAll(".option")
const area = document.getElementById("database-objects")

let currentColor = "transparent"
let currentObj = null

let level = ""

const clickBlock = (block) => {
    block.style.backgroundColor = currentColor
    const styleClasses = block.classList
    let xValue = 0
    let yValue = 0
    styleClasses.forEach(styleClass => {
        if (styleClass != "square") {
            if (styleClass[0] == "x") {
                xValue = parseInt(styleClass[1])
            }
            else if (styleClass[0] == "y") {
                yValue = parseInt(styleClass[1])
            }
        }
    })
    const obj = { id: parseInt(block.id), x: xValue, y: yValue, type: currentObj }
    if (currentObj != null) {
        const text = area.value
        if (text.length == 0 && obj.type != "delete") {
            area.innerText = `[${JSON.stringify(obj)}]`
        } else {
            const arrayObj = JSON.parse(area.value)
            let array = arrayObj
            let putNew = true
            arrayObj.forEach(val => {
                if (val.id == obj.id && obj.type != "delete") {
                    const index = arrayObj.indexOf(val)
                    array[index] = obj
                    putNew = false
                } else if (val.id == obj.id) {
                    const index = arrayObj.indexOf(val)
                    array.splice(index, 1)
                    putNew = false
                }
            })
            if (putNew == true && obj.type != "delete") {
                array.push(obj)
            }
            area.innerText = JSON.stringify(array)
        }
    }
}

options.forEach(option => {
    option.addEventListener("click", () => {
        if (option.id == "wall") {
            currentColor = "green"
            currentObj = option.id
        }
        else if (option.id == "enemy") {
            currentColor = "red"
            currentObj = option.id
        }
        else if (option.id == "treasure") {
            currentColor = "blue"
            currentObj = option.id
        }
        else if (option.id == "light") {
            currentColor = "yellow"
            currentObj = option.id
        }
        else if (option.id == "delete") {
            currentColor = "transparent "
            currentObj = option.id
        }
        else if (option.id == "load-level") {
            fetch("http://localhost:5000/get-level", {
                method: "GET",
                mode: "no-cors"
            })
                .then(res => res.json())
                .then(data => {
                    level = JSON.stringify(data)
                    const boxes = document.querySelectorAll(".square")
                    boxes.forEach(box => {
                        box.style.backgroundColor = "transparent"
                    })
                    area.innerText = ""
                    levelObj = JSON.parse(level)
                    levelObj.forEach(field => {
                        const box = document.getElementById(field.id)
                        const obj = { id: parseInt(field.id), x: field.x, y: field.y, type: field.type }
                        const text = area.value
                        if (text.length == 0) {
                            area.innerText = `[${JSON.stringify(obj)}]`
                        } else {
                            const arrayObj = JSON.parse(area.value)
                            let array = arrayObj
                            let putNew = true
                            arrayObj.forEach(val => {
                                if (val.id == obj.id) {
                                    const index = arrayObj.indexOf(val)
                                    array[index] = obj
                                    putNew = false
                                }
                            })
                            if (putNew == true) {
                                array.push(obj)
                            }
                            area.innerText = JSON.stringify(array)
                        }
                        switch (field.type) {
                            case "wall":
                                box.style.backgroundColor = "green"
                                break
                            case "enemy":
                                box.style.backgroundColor = "red"
                                break
                            case "treasure":
                                box.style.backgroundColor = "blue"
                                break
                            case "light":
                                box.style.backgroundColor = "yellow"
                                break
                        }
                    })
                })

        } else if (option.id == "save-level") {
            level = area.value
            console.log(typeof (level))
            fetch("/save-level", {
                method: "POST",
                mode: "no-cors",
                body: level,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                }
            }).then(res => res.text())
                .then(data => {
                    console.log(data)
                    window.alert("level saved successfully")
                })
        }
        else if (option.id == "save-test-level") {
            level = area.value
        }
    })
})
let x = 0
for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
        const block = document.createElement("div")
        block.setAttribute("id", `${x}`)
        block.classList.add("square", `x${j}`, `y${i}`)
        block.style.marginTop = `${60 * i}px`
        block.style.marginLeft = `${60 * j}px`
        block.addEventListener("click", () => {
            clickBlock(block)
        })
        board.append(block)
        x++
    }
}
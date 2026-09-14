const display = document.getElementById("display");

const historyDisplay =
    document.getElementById("history");

const historyList =
    document.getElementById("historyList");

const modeButton =
    document.getElementById("modeButton");


let mode = "DEG";

let history = [];


function appendValue(value) {

    if (value === "²") {

        display.value += "^2";

    }

    else {

        display.value += value;

    }
}


function clearDisplay() {

    display.value = "";

    historyDisplay.innerText = "";

}


function backspace() {

    display.value =
        display.value.slice(0, -1);

}


function toggleMode() {

    if (mode === "DEG") {

        mode = "RAD";

        modeButton.innerText = "RAD";

    }

    else {

        mode = "DEG";

        modeButton.innerText = "DEG";

    }
}


async function calculate() {

    const expression = display.value;

    if (!expression) {
        return;
    }


    historyDisplay.innerText =
        expression;


    try {

        const response = await fetch(
            "/calculate",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    expression: expression,
                    mode: mode
                })
            }
        );


        const data = await response.json();


        if (data.success) {

            display.value =
                data.result;

            addHistory(
                expression,
                data.result
            );

        }

        else {

            display.value =
                "Error";

        }

    }

    catch (error) {

        display.value =
            "Server Error";

        console.error(error);

    }
}


function addHistory(expression, result) {

    history.unshift({
        expression: expression,
        result: result
    });


    if (history.length > 10) {

        history.pop();

    }


    renderHistory();

}


function renderHistory() {

    historyList.innerHTML = "";


    history.forEach(item => {

        const div =
            document.createElement("div");

        div.className =
            "history-item";

        div.innerText =
            `${item.expression} = ${item.result}`;


        div.onclick = function () {

            display.value =
                item.expression;

        };


        historyList.appendChild(div);

    });

}


document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key >= "0" &&
            event.key <= "9"
        ) {

            appendValue(event.key);

        }

        else if (
            ["+", "-", "*", "/",
             ".", "(", ")"].includes(event.key)
        ) {

            appendValue(
                event.key === "*"
                    ? "×"
                    : event.key === "/"
                        ? "÷"
                        : event.key
            );

        }

        else if (event.key === "Enter") {

            calculate();

        }

        else if (event.key === "Backspace") {

            backspace();

        }

        else if (event.key === "Escape") {

            clearDisplay();

        }

    }
);
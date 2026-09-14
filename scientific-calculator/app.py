from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/calculate", methods=["POST"])
def calculate():

    data = request.get_json()

    expression = data.get("expression", "")
    mode = data.get("mode", "DEG")

    try:

        result = calculate_expression(expression, mode)

        return jsonify({
            "success": True,
            "result": result
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })


def calculate_expression(expression, mode):

    expression = expression.replace("×", "*")
    expression = expression.replace("÷", "/")
    expression = expression.replace("^", "**")

    # Constants
    expression = expression.replace("π", "math.pi")
    expression = expression.replace("e", "math.e")

    # Functions
    expression = expression.replace("sqrt", "math.sqrt")
    expression = expression.replace("log", "math.log10")
    expression = expression.replace("ln", "math.log")

    # Trigonometric functions
    if mode == "DEG":

        expression = expression.replace(
            "sin(", "math.sin(math.radians("
        )

        expression = expression.replace(
            "cos(", "math.cos(math.radians("
        )

        expression = expression.replace(
            "tan(", "math.tan(math.radians("
        )

        # Close radians conversion
        expression = close_trig_parentheses(expression)

    else:

        expression = expression.replace(
            "sin(", "math.sin("
        )

        expression = expression.replace(
            "cos(", "math.cos("
        )

        expression = expression.replace(
            "tan(", "math.tan("
        )

    # Factorial
    expression = replace_factorials(expression)

    allowed = {
        "math": math
    }

    result = eval(
        expression,
        {"__builtins__": {}},
        allowed
    )

    if isinstance(result, float):

        if result.is_integer():
            return int(result)

        return round(result, 10)

    return result


def replace_factorials(expression):

    while "!" in expression:

        position = expression.index("!")

        start = position - 1

        while start >= 0 and (
            expression[start].isdigit()
            or expression[start] == "."
        ):
            start -= 1

        number = expression[start + 1:position]

        factorial = f"math.factorial({number})"

        expression = (
            expression[:start + 1]
            + factorial
            + expression[position + 1:]
        )

    return expression


def close_trig_parentheses(expression):

    # Handles common expressions such as sin(30)
    expression = expression.replace(
        "math.radians(", "math.radians("
    )

    return expression


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
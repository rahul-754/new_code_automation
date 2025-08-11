from flask import Flask, render_template, request, jsonify
from fetcher import fetch_html
from code_generator import generate_extractor_function

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/load_url", methods=["POST"])
def load_url():
    url = request.json.get("url")
    try:
        html = fetch_html(url)
        return jsonify({"status": "ok", "html": html})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    fn_name = data["function_name"]
    fields = data["fields"]
    code = generate_extractor_function(fn_name, fields)
    return jsonify({"code": code})

if __name__ == "__main__":
    app.run(debug=True)

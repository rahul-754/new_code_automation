from flask import Flask, render_template, request, jsonify
from fetcher import fetch_html
from code_generator import generate_extractor_function
from urllib.parse import urlparse
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/load_url", methods=["POST"])
def load_url():
    url = request.json.get("url")
    try:
        html = fetch_html(url)

        # Check for template
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname.replace("www.", "")
        template_name = hostname.replace(".", "_")
        template_path = f"extractor_templates/{template_name}.py"

        response_data = {"status": "ok", "html": html}
        if os.path.exists(template_path):
            response_data["template"] = template_name

        return jsonify(response_data)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    fn_name = data["function_name"]
    fields = data["fields"]
    code = generate_extractor_function(fn_name, fields)
    return jsonify({"code": code})

@app.route("/generate_from_template")
def generate_from_template():
    template_name = request.args.get("template")

    # Security: ensure template_name is just a filename
    if not template_name or "/" in template_name or "\\" in template_name:
        return jsonify({"error": "Invalid template name"}), 400

    template_path = f"extractor_templates/{template_name}.py"

    if not os.path.exists(template_path):
        return jsonify({"error": "Template not found"}), 404

    with open(template_path, "r") as f:
        code = f.read()

    return jsonify({"code": code})

if __name__ == "__main__":
    app.run(debug=True)

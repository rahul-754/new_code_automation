document.getElementById("loadBtn").onclick = async () => {
    const url = document.getElementById("urlInput").value;
    const res = await fetch("/load_url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (data.status === "ok") {
        const iframe = document.getElementById("preview");
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(data.html);
        doc.close();

        // Inject selector.js into iframe
        const script = doc.createElement("script");
        script.src = "/static/selector.js";
        doc.body.appendChild(script);

        // Listen for selectors from iframe
        window.addEventListener("message", function handler(ev) {
            if (ev.data && ev.data.type === "selector-picked") {
                const {selector, text} = ev.data;
                const field = prompt(`Field name for:\n${text}\n\nSelector:\n${selector}`);
                if (field) addField(field, selector);
            }
        });
    } else {
        alert("Error: " + data.message);
    }
};

function addField(name, selector) {
    const container = document.getElementById("fieldsContainer");
    const div = document.createElement("div");
    div.className = "field-entry";
    div.innerHTML = `
        <b>${name}</b>
        <span style="color:gray;">→</span>
        <code>${selector}</code>
        <label> Multiple? <input type="checkbox" class="multi"></label>
        <span class="remove-btn" onclick="this.parentNode.remove()">&#10060;</span>
    `;
    div.dataset.name = name;
    div.dataset.selector = selector;
    container.appendChild(div);
}

document.getElementById("generateBtn").onclick = async () => {
    const fn_name = "extract_structured_data";
    const fields = [];
    document.querySelectorAll("#fieldsContainer .field-entry").forEach(div => {
        fields.push({
            name: div.dataset.name,
            selector: div.dataset.selector,
            multiple: div.querySelector(".multi").checked
        });
    });

    const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ function_name: fn_name, fields })
    });
    const data = await res.json();
    document.getElementById("generatedCode").textContent = data.code;
};

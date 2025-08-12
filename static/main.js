// Enhanced JavaScript for better UX
document.getElementById("loadBtn").addEventListener("click", async () => {
    const url = document.getElementById("urlInput").value;
    if (!url) {
        alert("Please enter a URL");
        return;
    }

    const loadingOverlay = document.getElementById("loadingOverlay");
    loadingOverlay.style.display = "flex";

    try {
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

            // Handle template button
            const generateTemplateBtn = document.getElementById("generateTemplateBtn");
            if (data.template) {
                generateTemplateBtn.style.display = "inline-flex";
                generateTemplateBtn.dataset.template = data.template;
            } else {
                generateTemplateBtn.style.display = "none";
            }

            // Inject selector.js into iframe
            const script = doc.createElement("script");
            script.src = "/static/selector.js";
            doc.body.appendChild(script);

            // Listen for selectors from iframe
            window.addEventListener("message", function handler(ev) {
                if (ev.data && ev.data.type === "selector-picked") {
                    const {selector, text} = ev.data;
                    const field = prompt(`Field name for:\n${text}\n\nSelector:\n${selector}`);
                    if (field) {
                        addField(field, selector);
                        document.getElementById("emptyState").style.display = "none";
                    }
                }
            });
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        alert("Error loading page: " + error.message);
    } finally {
        loadingOverlay.style.display = "none";
    }
});

document.getElementById("generateTemplateBtn").addEventListener("click", async () => {
    const template = document.getElementById("generateTemplateBtn").dataset.template;
    if (!template) {
        alert("No template selected");
        return;
    }

    const generateBtn = document.getElementById("generateTemplateBtn");
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;

    try {
        const res = await fetch(`/generate_from_template?template=${template}`);
        const data = await res.json();
        if (data.error) {
            alert("Error generating code: " + data.error);
        } else {
            document.getElementById("generatedCode").textContent = data.code;
        }
    } catch (error) {
        alert("Error generating code: " + error.message);
    } finally {
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate from Template';
        generateBtn.disabled = false;
    }
});

function addField(name, selector) {
    const container = document.getElementById("fieldsContainer");
    const emptyState = document.getElementById("emptyState");

    if (emptyState) {
        emptyState.style.display = "none";
    }

    const div = document.createElement("div");
    div.className = "field-entry";
    div.innerHTML = `
        <div class="field-header">
            <span class="field-name">${name}</span>
            <button class="remove-btn" onclick="this.closest('.field-entry').remove(); checkEmptyState();">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="field-selector">${selector}</div>
        <div class="field-controls">
            <label class="checkbox-wrapper">
                <input type="checkbox" class="multi">
                <span>Multiple values</span>
            </label>
        </div>
    `;
    div.dataset.name = name;
    div.dataset.selector = selector;
    container.appendChild(div);
}

function checkEmptyState() {
    const container = document.getElementById("fieldsContainer");
    const entries = container.querySelectorAll(".field-entry");
    const emptyState = document.getElementById("emptyState");

    if (entries.length === 0 && emptyState) {
        emptyState.style.display = "block";
    }
}

document.getElementById("generateBtn").addEventListener("click", async () => {
    const fn_name = "extract_structured_data";
    const fields = [];
    const entries = document.querySelectorAll("#fieldsContainer .field-entry");

    if (entries.length === 0) {
        alert("Please select at least one field");
        return;
    }

    entries.forEach(div => {
        fields.push({
            name: div.dataset.name,
            selector: div.dataset.selector,
            multiple: div.querySelector(".multi").checked
        });
    });

    const generateBtn = document.getElementById("generateBtn");
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;

    try {
        const res = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ function_name: fn_name, fields })
        });
        const data = await res.json();
        document.getElementById("generatedCode").textContent = data.code;
    } catch (error) {
        alert("Error generating code: " + error.message);
    } finally {
        generateBtn.innerHTML = '<i class="fas fa-code"></i> Generate Python Code';
        generateBtn.disabled = false;
    }
});

function copyCode() {
    const code = document.getElementById("generatedCode").textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

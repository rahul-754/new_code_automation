(function() {


    
    // Get full unique selector for an element
    function getUniqueSelector(el) {
        if (!(el instanceof Element)) return null;
        const parts = [];
        while (el && el.nodeType === 1 && el.tagName.toLowerCase() !== 'html') {
            let selector = el.tagName.toLowerCase();
            if (el.id) {
                selector = '#' + el.id;
                parts.unshift(selector);
                break;
            } else {
                if (el.className) {
                    const classes = el.className.trim().split(/\s+/).filter(Boolean).join('.');
                    if (classes) selector += '.' + classes;
                }
                // nth-of-type
                let sibling = el, nth = 1;
                while (sibling = sibling.previousElementSibling) {
                    if (sibling.tagName === el.tagName) nth++;
                }
                selector += `:nth-of-type(${nth})`;
                parts.unshift(selector);
                el = el.parentElement;
            }
        }
        return parts.join(' > ');
    }

    let last = null;
    document.body.addEventListener("mouseover", e => {
        if (last) last.classList.remove("mini-portia-highlight");
        e.target.classList.add("mini-portia-highlight");
        last = e.target;
    }, true);

    document.body.addEventListener("mouseout", e => {
        e.target.classList.remove("mini-portia-highlight");
    }, true);

    document.body.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const selector = getUniqueSelector(e.target);
        window.parent.postMessage({
            type: "selector-picked",
            selector: selector,
            text: e.target.innerText.trim().slice(0, 100)
        }, "*");
    }, true);

    // Add highlight style
    const style = document.createElement("style");
    style.innerHTML = `
        .mini-portia-highlight {
            outline: 2px solid red !important;
            background-color: rgba(255, 0, 0, 0.2) !important;
            cursor: pointer !important;
        }
    `;
    document.head.appendChild(style);
})();

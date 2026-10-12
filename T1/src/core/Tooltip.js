export class Tooltip {
    constructor() {
        this.box = document.createElement('div');
        this.box.id = "box";
        this.box.style.padding = "6px 14px";
        this.box.style.top = "0";
        this.box.style.left = "0";
        this.box.style.position = "fixed";
        this.box.style.backgroundColor = "rgba(234, 230, 224, 0.31)";
        this.box.style.backdropFilter = "blur(10px)"
        this.box.style.fontSize = "12px";
        this.box.style.borderRadius = "0 15px 15px 15px";
        this.box.style.color = "white";
        this.box.style.fontFamily = "Roboto, sans-serif";

        this.keyBox = document.createElement('div')
        this.box.appendChild(this.keyBox)

        this.textnode = document.createTextNode("");
        this.box.appendChild(this.textnode);
        document.body.appendChild(this.box);

        this.keys = []
    }

    addMessage(newText) {
        this.textnode.nodeValue = newText;
    }

    updateKeys(keys) {
        this.keys = keys

        const div = document.createElement('div')
            div.style.display = "flex"
            div.style.justifyContent = "center"
            div.style.textAlign = "center"
            div.style.gap = "10px"
            div.style.margin = "10px"

        this.keys.forEach((key, i) => {
            const textnode = document.createTextNode(i+1)
            const keyDiv = document.createElement('div')
                keyDiv.style.backgroundColor = key
                keyDiv.style.width = "15px"
                keyDiv.style.height = "15px"
                keyDiv.style.borderRadius = "50%"
                keyDiv.style.padding = "10px"
            keyDiv.appendChild(textnode)
            div.appendChild(keyDiv)
        })

        this.keyBox.replaceChildren(div)
    }

    updateText(text) {
        this.textnode.textContent = text
    }

    add(text) {

        return

        var textnode = document.createTextNode(text);
        this.box.appendChild(textnode);
        //this.addParagraph();
    }

    hide() {
        this.textnode.nodeValue = "";
        this.box.style.backgroundColor = "rgba(0,0,0,0)";
    }

    changeStyle(backcolor, fontColor, size = "26px", font = "sans-serif") {
        this.box.style.backgroundColor = backcolor;
        this.box.style.color = fontColor;
        this.box.style.fontFamily = font;
        this.box.style.fontSize = size;
    }
}
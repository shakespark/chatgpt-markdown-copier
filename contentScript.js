function copyToClipboard(txt) {
    navigator.permissions.query({ name: "clipboard-write" }).then((permissionStatus) => {
        if (permissionStatus.state === "granted") {
            navigator.clipboard
                .writeText(txt)
                .catch((err) => {
                    alert("Error: Please try again.");
                });
        } else {
            alert("Permission to write to clipboard denied by your settings.");
        }
    });
}

function processNode(node) {
    console.log('Processing Node:', node.nodeName, ' - Content:', node.outerHTML);

    if (node.nodeName === 'P') {
        return node.innerText + '\n';
    } else if (node.nodeName === 'STRONG') {
        return node.innerText + '：';
    } else if (node.nodeName === '#text') {
        return node.nodeValue;
    } else if (node.nodeName === 'UL' || node.nodeName === 'OL') {
        return processListItems(node, node.nodeName === 'OL') + '\n';
    } else { // 对于除上述之外的所有节点
        return node.innerText + '\n';
    }
    return '';
}

function processListItems(list, isOrdered = true) {
    console.log('Processing List:', list.nodeName, ' - Content:', list.outerHTML);
    let result = '';
    let index = 1;

    list.querySelectorAll(':scope > li').forEach(li => {
        let liContent = Array.from(li.childNodes).map(child => {
            if (child.nodeName === 'UL' || child.nodeName === 'OL') {
                return processListItems(child, child.nodeName === 'OL');
            } else {
                return processNode(child);
            }
        }).join('');

        result += isOrdered ? (index + '. ') : '· ';
        result += liContent.trim() + '\n';
        index++;
    });

    return result;
}

function processAndReturnText(inputHTML) {
    const doc = new DOMParser().parseFromString(inputHTML, 'text/html');
    let newText = '';

    doc.body.childNodes.forEach(node => {
        newText += processNode(node);
    });

    return newText.trim();
}

let prevQueriesNumber = undefined;
//https://yesicon.app/fluent/text-field-20-regular
const textSvgIcon = `<svg viewBox="0 0 20 20" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M10.5 6H13v.5a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 1 0V6h2.5v8H9a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-.5V6ZM2 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6Zm3-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5Z"/>
    </svg>`;
//https://yesicon.app/fluent/text-field-20-filled
const textCopiedSvgIcon = `<svg viewBox="0 0 20 20" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M2 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6Zm4-.5v1a.5.5 0 0 0 1 0V6h2.5v8H9a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-.5V6H13v.5a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5Z"/>    
    </svg>`;

function createCopyButton() {
    const answers = document.querySelectorAll(".markdown.prose");

    // If no answers are found, reset the prevQueriesNumber and return.
    if (!answers.length) {
        prevQueriesNumber = 0;
        return;
    }

    // If the number of answers is the same as before, don't recreate the buttons.
    if (answers.length === prevQueriesNumber) return;

    prevQueriesNumber = answers.length;

    for (const answer of answers) {
        // Check if the button already exists for this answer.
        if (answer.parentNode.parentNode.querySelector(".copy-btn")) continue;

        //answer.style.position = "relative";

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn flex ml-auto gap-2 rounded-md p-1 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400";
        //copyBtn.innerText = "T";
        copyBtn.innerHTML = textSvgIcon;
        //copyBtn.style.position = "absolute";
        //copyBtn.style.right = "0";
        //copyBtn.style.top = "0";

        //answer.appendChild(copyBtn);
        answer.parentNode.parentNode.nextSibling.firstChild.lastChild.appendChild(copyBtn);

        copyBtn.addEventListener("click", () => {
            const rawHTML = answer.innerHTML;
            console.log("rawHTML");
            console.log(rawHTML);
            const processedText = processAndReturnText(rawHTML);
            console.log("Processed Text:", processedText);
            //console.log(processedHTML);
            //console.log("innerText");
            //console.log(processedHTML.innerText);
            //copyToClipboard(processedHTML.innerText);
            copyToClipboard(processedText);
            copyBtn.innerHTML = textCopiedSvgIcon;
            setTimeout(() => {
                copyBtn.innerHTML = textSvgIcon;
            }, 2000);
        });
    }
}

// Check for new answers every 5 seconds.
setInterval(createCopyButton, 5000);

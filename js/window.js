const clipboardy = require('clipboardy');

// loadItems to item array then replace it with database usage. Load 10 items to the array.
// item should has timestamp dateCreated and text value.
let items = [];

function loadItems() {
    items.forEach((item) => {
        appendUnderSearchBox(item)
    });
}

function appendUnderSearchBox(item) {
    let containerContent = '<img class="img-circle media-object pull-left" src="assets/img/iconfinder_document_text.png" width="32"height="32"><div class="media-body"><strong>'
        + item.dateCreated
        + '</strong><p>'
        + item.value
        + '</p></div>'
    const searchBoxHeader = document.querySelector('#searchBoxHeader');
    searchBoxHeader.insertAdjacentHTML('afterend', containerContent)
}

function saveValue(item) {
    items.push(item)
}

function createItem(param) {
    const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" };
    let dateCreated = new Intl.DateTimeFormat('utc', options).format(new Date());
    let item = { dateCreated: dateCreated, value: param };
    return item;
}

async function listenClipboardOnChange() {
    setTimeout(listenClipboardOnChange, 200)
    let item = items[items.length - 1]
    let latestCopyValue = clipboardy.readSync()
    if (shouldSave(item, latestCopyValue)) {
        let item = createItem(latestCopyValue);
        saveValue(item)
        appendUnderSearchBox(item)
    }
}

window.onload = () => {
    listenClipboardOnChange();
};

function shouldSave(item, latestCopyValue) {
    return (item == undefined && (latestCopyValue != '' || latestCopyValue != undefined)) ||
        (item != undefined && item.value != latestCopyValue);
}

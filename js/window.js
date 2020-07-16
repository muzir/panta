const clipboardy = require('clipboardy');

// loadItems to item array then replace it with database usage. Load 10 items to the array.
// item should has timestamp dateCreated and text value.
let items = [];

function anchorOnClick(event) { console.log(this.querySelector('.foo').value) };

function listItemOnClickHandler(){
    const listGroupItem = document.querySelector('.list-group-item');
    listGroupItem.onclick = anchorOnClick
}

function appendUnderSearchBox(item) {
    let containerContent = '<li class="list-group-item"><img class="img-circle media-object pull-left" src="assets/img/iconfinder_document_text.png" width="32"height="32"><div class="media-body"><strong>'
        + item.dateCreated
        + '</strong><p class="foo">'
        + item.value
        + '</p></div></li>'
    const searchBoxHeader = document.querySelector('#searchBoxHeader');
    searchBoxHeader.insertAdjacentHTML('afterend', containerContent)
    listItemOnClickHandler()
}

function saveValue(item) {
    items.push(item)
}

function createItem(param) {
    const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" }
    let dateCreated = new Intl.DateTimeFormat('utc', options).format(new Date())
    let item = { dateCreated: dateCreated, value: param }
    return item;
}

async function listenClipboardOnChange() {
    setTimeout(listenClipboardOnChange, 200)
    let item = items[items.length - 1]
    let latestCopyValue = clipboardy.readSync()
    if (shouldSave(item, latestCopyValue)) {
        let item = createItem(latestCopyValue)
        saveValue(item)
        appendUnderSearchBox(item)
    }
}

window.onload = () => {
    listenClipboardOnChange()
    listItemOnClickHandler()
};

function shouldSave(item, latestCopyValue) {
    return (item == undefined && (latestCopyValue != '' || latestCopyValue != undefined)) ||
        (item != undefined && item.value != latestCopyValue)
}

const clipboardy = require('clipboardy');

// loadItems to item array then replace it with database usage. Load 10 items to the array.
// item should has timestamp dateCreated and text value.
let items = [];

function loadItems() {
    let containerContent = '';
    items.forEach((item) => {
        containerContent = containerContent
            + '<img class="img-circle media-object pull-left" src="assets/img/iconfinder_document_text.png" width="32"height="32"><div class="media-body"><strong>'
            + item.dateCreated
            + '</strong><p>'
            + item.value
            + '</p></div>'
    });
    const container = document.querySelector('#container');
    container.innerHTML = containerContent;
    setTimeout(() => {
        loadItems()
    }, 200);
}

function saveValue(param) {
    const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" };
    let dateCreated = new Intl.DateTimeFormat('utc', options).format(new Date());
    let item = { dateCreated: dateCreated, value: param }
    items.push(item)
}

async function listenClipboardOnChange() {
    setTimeout(listenClipboardOnChange, 200)
    let item = items[items.length - 1]
    let latestCopyValue = clipboardy.readSync()
    if (item == undefined && (latestCopyValue != '' || latestCopyValue != undefined)) {
        saveValue(latestCopyValue)
        return
    }
    else if (item.value != latestCopyValue) {
        console.log('latestCopyValue:' + latestCopyValue)
        console.log('item.value:' + item.value)
        saveValue(latestCopyValue)
    }
}

window.onload = () => {
    listenClipboardOnChange();
    loadItems();
};
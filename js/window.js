const clipboardy = require('clipboardy');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('panta.db');

// loadItems to item array then replace it with database usage. Load 10 items to the array.
// item should has timestamp dateCreated and text value.
let items = [];

window.onload = () => {
    db.serialize(function () {
        db.run("CREATE TABLE if not exists clipboard_history (uniqueId INTEGER, info TEXT, dateCreated INTEGER)");

    });

    listenClipboardOnChange()
};

function loadItems() {
    db.serialize(function () {
        db.each("SELECT uniqueId AS uniqueId, info, dateCreated FROM clipboard_history", function (err, row) {
            console.log(row.uniqueId + ": " + row.info + ":" + row.dateCreated);
        });
    });


    if (items.length == 0) {
        return
    }
    let lastTenItemContent = ''
    let lastItemIndex = items.length - 1
    for (let i = 0; i < 10; i++) {
        let item = items[lastItemIndex - i]
        if (item != undefined) {
            lastTenItemContent = lastTenItemContent + createRowHtmlFromItem(item)
        }
    }
    const searchBoxHeaderElement = document.querySelector('#content');
    searchBoxHeaderElement.innerHTML = lastTenItemContent
}

function listenClipboardOnChange() {
    setTimeout(function () {
        let item = items[items.length - 1]
        let latestCopyValue = clipboardy.readSync()
        if (shouldSave(item, latestCopyValue)) {
            let item = createItem(latestCopyValue)
            saveValue(item)
            loadItems();
        }
        listenClipboardOnChange();
    }, 200);
}

function searchBoxOnChangeListener(event) {
    console.log('Search key : ' + event.target.value)
}

function shouldSave(item, latestCopyValue) {
    return (item == undefined && (latestCopyValue != '' || latestCopyValue != undefined)) ||
        (item != undefined && item.value != latestCopyValue)
}

function createItem(param) {
    const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" }
    let uniqueId = (new Date()).getTime()
    let dateCreated = new Intl.DateTimeFormat('utc', options).format(new Date())
    let item = { id: uniqueId, dateCreated: dateCreated, value: param }
    return item;
}

function saveValue(item) {
    db.serialize(function () {
        db.run("CREATE TABLE if not exists clipboard_history (uniqueId INTEGER, info TEXT, dateCreated INTEGER)");
        var stmt = db.prepare("INSERT INTO clipboard_history VALUES (?,?,?)");
        stmt.run(item.id, item.value, item.dateCreated);
        stmt.finalize();
    });

    items.push(item)
}

function createRowHtmlFromItem(item) {
    return '<li class="list-group-item"><img class="img-circle media-object pull-left" src="assets/img/iconfinder_document_text.png" width="32"height="32"><div class="media-body"><strong>'
        + item.dateCreated
        + '</strong><p id="' + item.id + '" onclick="listItemOnClickHandler(this.id)">'
        + item.value
        + '</p></div></li>';
}


function listItemOnClickHandler(id) {
    /**Pretty bad performance, will be replaced by database delete operation */
    removeItem(id);
    let selectedValue = document.getElementById(id).innerHTML
    clipboardy.writeSync(selectedValue)
}
function removeItem(id) {
    let removeIndex = items.map(item => item.id).indexOf(parseInt(id));
    if (removeIndex >= 0) {
        items.splice(removeIndex, 1);
    }
}
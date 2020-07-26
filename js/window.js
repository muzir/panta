const clipboardy = require('clipboardy');
const sqlite3 = require('sqlite3').verbose();

let lastItemValue
let db = new sqlite3.Database('panta.db', sqlite3.OPEN_READWRITE)

function getDatabaseConnection(){
    return new sqlite3.Database('panta.db', sqlite3.OPEN_READWRITE)
}

window.onload = () => {
    
    this.db.serialize(function () {
        this.db.run("CREATE TABLE if not exists clipboard_history (uniqueId INTEGER, info TEXT, dateCreated INTEGER)");

    });

    this.db.serialize(function () {
        this.db.get("SELECT info FROM clipboard_history ORDER BY uniqueId DESC LIMIT 1", function (err, row) {
            lastItemValue = row.info
        })
    })
    this.db.close()
    loadItems()
    listenClipboardOnChange()
};

function loadItems() {
    console.log('loadItems')
    let db = getDatabaseConnection()
    db.serialize(function () {
        db.all("SELECT uniqueId AS uniqueId, info, dateCreated FROM clipboard_history ORDER BY uniqueId DESC LIMIT 10", function (err, rows) {
            let lastTenItemContent = ''
            rows.forEach((row) => {
                let item = { id: row.uniqueId, dateCreated: row.dateCreated, value: row.info }
                console.log('row:'+row.info)
                lastTenItemContent = lastTenItemContent + createRowHtmlFromItem(item)
            });
            const searchBoxHeaderElement = document.querySelector('#content')
            searchBoxHeaderElement.innerHTML = lastTenItemContent
        })

    });
    db.close()
}

function listenClipboardOnChange() {
    setTimeout(function () {
        let latestCopyValue = clipboardy.readSync()
        if (shouldSave(latestCopyValue)) {
            console.log('shouldSave')
            console.log('latestCopyValue:' + latestCopyValue)
            console.log('lastItemValue:' + lastItemValue)
            lastItemValue = latestCopyValue
            createItem(latestCopyValue)
                .then(newItem => saveValue(newItem))
                .then(result => loadItems())
        }
        listenClipboardOnChange();
    }, 200);
}

function searchBoxOnChangeListener(event) {
    console.log('Search key : ' + event.target.value)
}

function shouldSave(latestCopyValue) {
    return (lastItemValue == undefined && (latestCopyValue != '' || latestCopyValue != undefined))
        || (lastItemValue != undefined && lastItemValue != latestCopyValue)
}


 function createItem(param) {
    return new Promise((resolve, reject) => {
        const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" }
        let uniqueId = (new Date()).getTime()
        let dateCreated = new Intl.DateTimeFormat('utc', options).format(new Date())
        let item = { id: uniqueId, dateCreated: dateCreated, value: param }
        resolve(item)
    });
}

function saveValue(item) {
    console.log('saveValue:'+item.value)
    let db = getDatabaseConnection()
    db.serialize(function () {
        var stmt = db.prepare("INSERT INTO clipboard_history VALUES (?,?,?)");
        stmt.run(item.id, item.value, item.dateCreated);
        stmt.finalize();
        console.log('saveValue finalize')
    });
    db.close()
    db = getDatabaseConnection()
    db.serialize(function () {
        db.get("SELECT info FROM clipboard_history ORDER BY uniqueId DESC LIMIT 1", function (err, row) {
            console.log('save select:'+row.info) 
        })
    })
    return item
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
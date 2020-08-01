const clipboardy = require('clipboardy');
const AppDAO = require('./js/dao')
const ClipboardHistoryRepository = require('./js/clipboard_history_repository')

let lastItemValue

const dao = new AppDAO('./panta.db')
const clipboardHistoryRepository = new ClipboardHistoryRepository(dao)


window.onload = () => {
    clipboardHistoryRepository.createTable()
    clipboardHistoryRepository.getLastElement().then((row) => {
        lastItemValue = row.info
        loadItems()
        listenClipboardOnChange()
    });
};

function loadItems() {
    clipboardHistoryRepository.getAll().then((rows) => {
        let lastTenItemContent = ''
        rows.forEach((row) => {
            let item = { id: row.uniqueId, dateCreated: row.dateCreated, value: row.info }
            lastTenItemContent = lastTenItemContent + createRowHtmlFromItem(item)
        });
        const searchBoxHeaderElement = document.querySelector('#content')
        searchBoxHeaderElement.innerHTML = lastTenItemContent
    })
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
    clipboardHistoryRepository.create(item)
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
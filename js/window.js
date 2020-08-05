const clipboardy = require('clipboardy');
const AppDAO = require('./js/dao')
const ClipboardHistoryRepository = require('./js/clipboard_history_repository')

let lastItemValue

const dao = new AppDAO('./panta.db')
const clipboardHistoryRepository = new ClipboardHistoryRepository(dao)

window.onload = () => {
    clipboardHistoryRepository.createTable()
        .then(() => clipboardHistoryRepository.getLastElement())
        .then((row) => lastItemValue = row && row.info)
        .then(() => loadItems())
        .then(() => listenClipboardOnChange())
};

function loadItems() {
    clipboardHistoryRepository.getAll().then((rows) => {
        setRowsToContent(rows)
    })
}

function setRowsToContent(rows) {
    let lastTenItemContent = ''
    const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" }
    rows.forEach((row) => {
        let formattedDateCreated = new Intl.DateTimeFormat('utc', options).format(new Date(row.dateCreated))
        let item = { id: row.id, formattedDateCreated: formattedDateCreated, info: row.info }
        lastTenItemContent = lastTenItemContent + createRowHtmlFromItem(item)
    });
    const searchBoxHeaderElement = document.querySelector('#content')
    searchBoxHeaderElement.innerHTML = lastTenItemContent
}

function listenClipboardOnChange() {
    setTimeout(function () {
        let latestCopyValue = clipboardy.readSync()
        if (shouldSave(latestCopyValue)) {
            lastItemValue = latestCopyValue
            createItem(latestCopyValue)
                .then(newItem => saveValue(newItem))
                .then(result => loadItems())
        }
        listenClipboardOnChange();
    }, 200);
}

function searchBoxOnChangeListener(event) {
    clipboardHistoryRepository.getBySearchKey(event.target.value).then((rows) => {
        setRowsToContent(rows)
    })
}

function shouldSave(latestCopyValue) {
    return (lastItemValue == undefined && (latestCopyValue != '' || latestCopyValue != undefined))
        || (lastItemValue != undefined && lastItemValue != latestCopyValue)
}


function createItem(param) {
    return new Promise((resolve, reject) => {
        let dateCreated = new Date().getTime()
        let item = { dateCreated: dateCreated, info: param }
        resolve(item)
    });
}

function saveValue(item) {
    clipboardHistoryRepository.create(item)
    return item
}

function createRowHtmlFromItem(item) {
    return '<li class="list-group-item"><img class="img-circle media-object pull-left" src="assets/img/iconfinder_document_text.png" width="32"height="32"><div class="media-body"><strong>'
        + item.formattedDateCreated
        + '</strong><p id="' + item.id + '" onclick="listItemOnClickHandler(this.id)">'
        + item.info
        + '</p></div></li>';
}

function listItemOnClickHandler(id) {
    clipboardHistoryRepository.delete(id).then(() => {
        let selectedValue = document.getElementById(id).innerHTML
        clipboardy.writeSync(selectedValue)
    })
}
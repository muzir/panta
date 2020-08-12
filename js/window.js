const clipboardy = require('clipboardy');
const AppDAO = require('./js/dao')
const ClipboardHistoryRepository = require('./js/clipboard_history_repository')
const electron = require('electron');


let deleteItemId

const userDataPath = (electron.app || electron.remote.app).getPath('userData');
const dao = new AppDAO(userDataPath + '/panta.db')
const clipboardHistoryRepository = new ClipboardHistoryRepository(dao)

window.onload = () => {
    clipboardHistoryRepository.createTable()
        .then(() => loadItems())
        .then(() => listenClipboardOnChange())
};

function loadItems() {
    clipboardHistoryRepository.getLastTenElements().then((rows) => {
        setRowsToContent(rows)
    })
}

function setRowsToContent(rows) {
    let lastTenItemContent = ''
    const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" }
    let tabIndex = 2
    rows.forEach((row) => {
        let formattedDateCreated = new Intl.DateTimeFormat('utc', options).format(new Date(row.dateCreated))
        let item = { id: row.id, formattedDateCreated: formattedDateCreated, info: row.info }
        lastTenItemContent = lastTenItemContent + createRowHtmlFromItem(item, tabIndex)
        tabIndex++
    });
    const contentDivElement = document.getElementById('content')
    contentDivElement.innerHTML = lastTenItemContent
}

function listenClipboardOnChange() {
    setTimeout(function () {
        let latestCopyValue = clipboardy.readSync()
        isNewItemCopied(latestCopyValue).then((isNew) => {
            if (isNew) {
                applyNewItemChange(latestCopyValue)
            }
        })
        listenClipboardOnChange();
    }, 100);
}

function applyNewItemChange(latestCopyValue) {
    console.log('new item :' + latestCopyValue)
    createItem(latestCopyValue)
        .then(newItem => saveValue(newItem))
        .then(() => deleteItemId && clipboardHistoryRepository.delete(deleteItemId))
        .then(result => loadItems())
}

function isNewItemCopied(latestCopyValue) {
    return new Promise((resolve) => {
        clipboardHistoryRepository.getLastElement()
            .then((row) => {
                let lastItemValue = row && row.info
                resolve((lastItemValue == undefined && (latestCopyValue != '' || latestCopyValue != undefined))
                    || (lastItemValue != undefined && lastItemValue != latestCopyValue))
            })
    })
}


function createItem(param) {
    return new Promise((resolve) => {
        let dateCreated = new Date().getTime()
        let item = { dateCreated: dateCreated, info: param }
        resolve(item)
    });
}

function saveValue(item) {
    clipboardHistoryRepository.create(item)
    return item
}

function createRowHtmlFromItem(item, tabIndex) {
    return '<li class="list-group-item"><img class="img-circle media-object pull-left" src="assets/img/iconfinder_document_text.png" width="32"height="32"><div class="media-body"><strong>'
        + item.formattedDateCreated
        + '</strong><p tabIndex="' + tabIndex + '" id="' + item.id + '" onclick="itemOnClickHandler(this.id)" onkeypress="itemOnKeyPressHandler(event)">'
        + replaceHtmlEscapeCharacter(item.info)
        + '</p></div></li>';
}

function replaceHtmlEscapeCharacter(str) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
}

function itemOnClickHandler(id) {
    let selectedValue = document.getElementById(id).innerText
    clipboardy.writeSync(selectedValue)
    deleteItemId = id
    cleanSearchBox()
}

function itemOnKeyPressHandler(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        itemOnClickHandler(event.target.id)
    }
}

function searchBoxOnChangeListener(event) {
    clipboardHistoryRepository.getBySearchKey(event.target.value).then((rows) => {
        setRowsToContent(rows)
    })
}

function cleanSearchBox(){
    const searchBoxElement = document.getElementById('searchBox')
    searchBoxElement.value = ''
}
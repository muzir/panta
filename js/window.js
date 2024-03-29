const { ipcRenderer } = require('electron');
const clipboardy = require('clipboardy')
const AppDAO = require('./js/dao')

const ClipboardHistoryRepository = require('./js/clipboard_history_repository')

let deleteItemId
let clipboardHistoryRepository
const RETENTION_PERIOD_IN_DAYS = 30

window.onload = () => {
    ipcRenderer.invoke('read-user-data', 'fileName.txt')
    .then(userDataPath => {
        const dao = new AppDAO(userDataPath + '/panta.db')
        clipboardHistoryRepository = new ClipboardHistoryRepository(dao)
        createClipboardHistoryTableIfNotExists()
        .then(deleteRecordsOlderThanRetentionPeriod)
        .then(() => {applyProfileChanges()})
        .then(() => {
            listenClipboardOnChange()
        }).catch(function (e) {
            console.log("Error in window onload!")
        });
    });
}

function deleteRecordsOlderThanRetentionPeriod() {
    /* RETENTION_PERIOD_IN_DAYS days calculation */
    let dateOffset = (24 * 60 * 60 * 1000) * RETENTION_PERIOD_IN_DAYS
    let retentionDate = new Date(Date.now())
    if (process.env.PROFILE !== 'integration') {
        retentionDate.setTime(retentionDate.getTime() - dateOffset)
    }
    return clipboardHistoryRepository.deleteByRetentionPeriod(retentionDate)
}

function createClipboardHistoryTableIfNotExists() {
    return clipboardHistoryRepository.createTable()
        .then(() => {
            return isTestProfileActive()
        })

    function isTestProfileActive() {
        return Promise.resolve(process.env.PROFILE === 'integration');
    }
}

function applyProfileChanges(value) {
    if (value) {
        return applyTestProfileChanges()
    } else {
        return loadItems()
    }

    function applyTestProfileChanges() {
        clipboardy.writeSync('')
    }
}

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
    })
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
        listenClipboardOnChange()
    }, 100)
}

function applyNewItemChange(latestCopyValue) {
    createItem(latestCopyValue)
        .then(newItem => saveValue(newItem))
        .then(() => deleteItemId && clipboardHistoryRepository.delete(deleteItemId))
        .then(() => loadItems())
}

function isNewItemCopied(latestCopyValue) {
    return new Promise((resolve) => {
        clipboardHistoryRepository.getLastElement()
            .then((row) => {
                let lastItemValue = row && row.info
                let isFirstElement = lastItemValue == undefined
                let conditionOne = (isFirstElement && latestCopyValue && latestCopyValue != '')
                let conditionTwo = (lastItemValue && latestCopyValue && lastItemValue != latestCopyValue)
                resolve(conditionOne || conditionTwo)
            })
    })
}


function createItem(param) {
    return new Promise((resolve) => {
        let dateCreated = new Date(Date.now()).getTime()
        let item = { dateCreated: dateCreated, info: param }
        resolve(item)
    })
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
        + '</p></div></li>'
}

function replaceHtmlEscapeCharacter(str) {
    str = str.replace(/&/g, "&amp;")
    str = str.replace(/>/g, "&gt;")
    str = str.replace(/</g, "&lt;")
    str = str.replace(/"/g, "&quot;")
    str = str.replace(/'/g, "&#039;")
    return str
}

function itemOnClickHandler(id) {
    clipboardHistoryRepository.getById(id)
        .then((row) => {
            let selectedValue = row.info
            clipboardy.writeSync(selectedValue)
            deleteItemId = id
            cleanSearchBox()
            hideWindow()
        })
}

function itemOnKeyPressHandler(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        event.preventDefault()
        itemOnClickHandler(event.target.id)
    }
}

function searchBoxOnChangeListener(event) {
    clipboardHistoryRepository.getBySearchKey(event.target.value).then((rows) => {
        setRowsToContent(rows)
    })
}

function cleanSearchBox() {
    const searchBoxElement = document.getElementById('searchBox')
    searchBoxElement.value = ''
}

function hideWindow() {
    ipcRenderer.send('hide');
}

let deleteItemId


window.onload = () => {
    window.api.send('toMain')
        .then((event, data) => {
            //applyProfileChanges()
            loadItems()
            listenClipboardOnChange()
        }).catch(function (e) {
            console.error("Error in window onload!" + e)
        });
}

function applyProfileChanges(value) {
    if (value) {
        return applyTestProfileChanges()
    } else {
        return loadItems()
    }

    function applyTestProfileChanges() {
        window.api.writeSync('')
    }
}

function loadItems() {
    window.api.getLastTenElements().then((response) => {
        setRowsToContent(response.data)
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
        window.api.readSync()
            .then((response) => {
                let value = response.data
                isNewItemCopied(response.data)
                    .then((isNew) => {
                        if (isNew) {
                            applyNewItemChange(value)
                        }
                    })
                listenClipboardOnChange()
            })
    }, 500)
}

function applyNewItemChange(latestCopyValue) {
    createItem(latestCopyValue)
        .then(() => {
            loadItems();
            deleteItemId && window.api.delete(deleteItemId)
            .then(() => {
                loadItems();
            })
        })
}

function isNewItemCopied(latestCopyValue) {
    return new Promise((resolve) => {
        window.api.getLastElement()
            .then((row) => {
                let lastItemValue = row && row.data && row.data.info
                let isFirstElement = lastItemValue == undefined
                let conditionOne = (isFirstElement && latestCopyValue && latestCopyValue != '')
                let conditionTwo = (lastItemValue && latestCopyValue && lastItemValue != latestCopyValue)
                let result = conditionOne || conditionTwo
                resolve(result)
            })
    })
}


function createItem(param) {
    return new Promise((resolve) => {
        let dateCreated = new Date(Date.now()).getTime()
        let item = { dateCreated: dateCreated, info: param }
        window.api.create(item)
            .then((result) => {
                resolve(item)
            })
    })
}

function createRowHtmlFromItem(item, tabIndex) {
    return '<li class="list-group-item"><img class="img-circle media-object pull-left" src="assets/img/iconfinder_document_text.png" width="32"height="32"><div class="media-body"><strong>'
        + item.formattedDateCreated
        + '</strong><p tabIndex="' + tabIndex + '" id="' + item.id + '" onclick="itemOnClickHandler(this.id)" onkeypress="itemOnKeyPressHandler(event)">'
        + replaceHtmlEscapeCharacter(item.info)
        + '</p></div></li>'
}
document.querySelector("#\\31 8938")
function replaceHtmlEscapeCharacter(str) {
    str = str.replace(/&/g, "&amp;")
    str = str.replace(/>/g, "&gt;")
    str = str.replace(/</g, "&lt;")
    str = str.replace(/"/g, "&quot;")
    str = str.replace(/'/g, "&#039;")
    return str
}

function itemOnClickHandler(id) {
    getById(id)
        .then((response) => {
            let selectedValue = response.data.info
            window.api.writeSync(selectedValue)
                deleteItemId = id
                cleanSearchBox()
                hideWindow()
        }).catch((err) => {
            console.error("Error in getById:", err);
        });

}

function getById(id) {
    return new Promise((resolve) => {
        window.api.getById(id)
            .then((row) => {
                resolve(row)
            }).catch((err) => {
                console.error("Error in getById:", err);
            });
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
    window.api.getBySearchKey(event.target.value).then((rows) => {
        setRowsToContent(rows.data)
    })
}

function cleanSearchBox() {
    const searchBoxElement = document.getElementById('searchBox')
    searchBoxElement.value = ''
}

function hideWindow() {
    window.api.send('hide')
}
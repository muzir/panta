// loadItems to item array then replace it with database usage. Load 10 items to the array.
// item should has timestamp dateCreated and text value.
let items = [];

function loadItems() {
    for (let i = 0; i < 10; i++) {
        const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" };
        let dateCreated = new Intl.DateTimeFormat('utc', options).format(new Date());
        let item = { dateCreated: dateCreated, value: "value" + i }
        items.push(item)
    }
}
window.onload = () => {
    loadItems();
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
}; 
class ClipboardHistoryRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = "CREATE TABLE if not exists clipboard_history (id INTEGER PRIMARY KEY AUTOINCREMENT, info TEXT, dateCreated INTEGER)"
        return this.dao.run(sql)
    }

    create(clipboard_history) {
        return this.dao.run(
            "INSERT INTO clipboard_history(info, dateCreated) VALUES (?,?)",
            [clipboard_history.info, clipboard_history.dateCreated])
    }

    delete(id) {
        return this.dao.run(
            "DELETE FROM clipboard_history WHERE id=?",
            [id])
    }

    deleteAll() {
        return this.dao.run(
            "DELETE FROM clipboard_history WHERE 1=1",
            [])
    }

    getById(id) {
        return this.dao.get(
            "SELECT info FROM clipboard_history WHERE id=?",
            [id])
    }

    getLastElement() {
        return this.dao.get(
            "SELECT info FROM clipboard_history ORDER BY dateCreated DESC LIMIT 1",
            [])
    }

    getLastTenElements() {
        return this.dao.all("SELECT id AS id, info, dateCreated FROM clipboard_history ORDER BY dateCreated DESC LIMIT 10")
    }

    getBySearchKey(searchKey) {
        let info = '%' + searchKey + '%';
        return this.dao.all("SELECT id AS id, info, dateCreated FROM clipboard_history where info like $info ORDER BY dateCreated DESC LIMIT 10", [info])
    }
}

module.exports = ClipboardHistoryRepository;
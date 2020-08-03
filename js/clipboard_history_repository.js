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

    getLastElement() {
        return this.dao.get(
            "SELECT info FROM clipboard_history ORDER BY dateCreated DESC LIMIT 1",
            [])
    }

    getAll() {
        return this.dao.all("SELECT id AS id, info, dateCreated FROM clipboard_history ORDER BY dateCreated DESC LIMIT 10")
    }
}

module.exports = ClipboardHistoryRepository;
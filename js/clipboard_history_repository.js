class ClipboardHistoryRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = "CREATE TABLE if not exists clipboard_history (uniqueId INTEGER, info TEXT, dateCreated INTEGER)"
        return this.dao.run(sql)
    }

    create(clipboard_history) {
        return this.dao.run(
            "INSERT INTO clipboard_history VALUES (?,?,?)",
            [clipboard_history.id, clipboard_history.value, clipboard_history.dateCreated])
    }

    getLastElement() {
        return this.dao.get(
            "SELECT info FROM clipboard_history ORDER BY uniqueId DESC LIMIT 1",
            [])
    }

    getAll() {
        return this.dao.all("SELECT uniqueId AS uniqueId, info, dateCreated FROM clipboard_history ORDER BY uniqueId DESC LIMIT 10")
    }
}

module.exports = ClipboardHistoryRepository;
const sqlite3 = require('sqlite3')

class AppDAO {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        console.error('Could not connect to database', err)
      } else {
        console.log('Connected to database')
      }
    })
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          resolve({ id: this.lastID })
        }
      })
    })
  }
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error(err)
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}

module.exports = AppDAO
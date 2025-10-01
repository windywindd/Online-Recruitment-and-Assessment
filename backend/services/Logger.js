// services/logger.js
class Logger {
  constructor() { if (Logger.instance) return Logger.instance; Logger.instance = this; }
  log(msg) { console.log(msg); }
}
module.exports = new Logger();

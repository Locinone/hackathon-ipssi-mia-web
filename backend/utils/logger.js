const kleur = require('kleur');

const logger = {
  info: (message) => {
    const date = new Date().toISOString();
    console.log(`${kleur.bgBlue().bold().white('INFO ')} ${kleur.blue(date)}: ${message}`);
  },
  error: (message) => {
    const date = new Date().toISOString();
    console.log(`${kleur.bgRed().bold().white('ERROR ')} ${kleur.red(date)}: ${message}`);
  },
  warn: (message) => {
    const date = new Date().toISOString();
    console.log(`${kleur.bgYellow().bold().white('WARN ')} ${kleur.yellow(date)}: ${message}`);
  },
  success: (message) => {
    const date = new Date().toISOString();
    console.log(`${kleur.bgGreen().bold().white('SUCCESS ')} ${kleur.green(date)}: ${message}`);
  },
  debug: (message) => {
    const date = new Date().toISOString();
    console.log(`${kleur.bgMagenta().bold().white('DEBUG ')} ${kleur.magenta(date)}: ${message}`);
  }
};

module.exports = logger;

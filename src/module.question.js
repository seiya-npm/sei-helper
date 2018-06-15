const readline = require('readline');

const question = query => new Promise(resolve => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });
    rl.question(`${query}: `, (answer) => {
        resolve(answer)
        rl.close();
    });
});

module.exports = {
    question
};
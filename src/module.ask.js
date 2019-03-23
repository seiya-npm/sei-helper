const ask = async function(arr){
    try{
        require.resolve('inquirer');
        const inquirer = require('inquirer');
        arr.message += `:`;
        const result = await inquirer.prompt(arr);
        return result[arr.name];
    }
    catch(e) {
        throw new Error(e.message);
    }
};

module.exports = ask;

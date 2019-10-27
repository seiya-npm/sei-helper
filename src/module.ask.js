const ask = async function(arr){
    try{
        require.resolve('inquirer');
        const inquirer = require('inquirer');
        if(!arr.name){
            arr.name = Math.random().toString(36).substring(8);
        }
        arr.message += `:`;
        const result = await inquirer.prompt(arr);
        return result[arr.name];
    }
    catch(e) {
        throw new Error(e.message);
    }
};

module.exports = ask;

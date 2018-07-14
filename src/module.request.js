const request = options => new Promise(resolve => {
    try{
        require.resolve('request');
        const doReq = require('request');
        doReq(options, (err, res) => {
            if (err){
                resolve({ "status": -1, err });
            }
            resolve({ "status": res.statusCode, res });
        });
    }
    catch(err) {
        resolve({ "status": -2, err });
    }
});

module.exports = {
    request
};
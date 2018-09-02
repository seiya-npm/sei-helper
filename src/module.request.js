const request = options => new Promise(resolve => {
    try{
        require.resolve('request');
        const doReq = require('request');
        doReq(options, (err, res) => {
            if (err){
                return resolve({ "status": -1, err });
            }
            return resolve({ "status": res.statusCode, res });
        });
    }
    catch(err) {
        return resolve({ "status": -2, err });
    }
});

module.exports = {
    request
};
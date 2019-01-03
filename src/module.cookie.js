const make = (data, keys) => {
    let res = [];
    for (let key of keys) {
        if (typeof data[key] !== 'object') continue;
        res.push(`${key}=${data[key].value}`);
    }
    return res.join('; ');
};

const parse = (data) => {
    let res = {};
    for (let line of data) {
        let c = line.split('; ');
        let val = c.shift().split('=');
        res[val[0]] = {
            value: val.slice(1).join('=')
        };
        for (let f of c) {
            let param = f.split('=');
            if (param[0].toLowerCase() === 'expires') {
                res[val[0]].expires = new Date(param[1]);
            } else if (param[1] === undefined) {
                res[val[0]][param[0]] = true;
            } else {
                res[val[0]][param[0]] = param[1];
            }
        }
    }
    return res;
};

module.exports = {
    make, parse
};

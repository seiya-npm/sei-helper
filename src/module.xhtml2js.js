// function
const xhtml2js = function({ src, el, isXml, parse }){
    // require
    const cheerio = require('cheerio');
    // parse to js
    const walk = function(data, log){
        const xhtml = {};
        if(data.length){
            data = data[0];
        }
        if(data.type == 'text'){
            let nullText = data.data.trim().replace(/(\r|\n|\s)/g,'');
            if(nullText != ''){
                data.name = '$text';
            }
        }
        if(data.name){
            xhtml.tagName = data.name;
        }
        else{
            return null;
        }
        if(data.attribs && JSON.stringify(data.attribs) != '{}'){
            xhtml.attribs = data.attribs;
        }
        if(data.name == '$text'){
            xhtml.attribs = { text: data.data.trim() };
        }
        xhtml.children = [];
        if(data.children && data.children.length > 0){
            for(let c=0;c<data.children.length;c++){
                let child = walk(data.children[c]);
                if(child){
                    xhtml.children.push(child);
                }
            }
        }
        return xhtml;
    };
    // config
    chIOcfg = {
        normalizeWhitespace: true,
        xmlMode: Boolean(isXml),
        decodeEntities: true
    };
    // load cheerio
    const $c = cheerio.load(src,chIOcfg);
    const $x = Boolean(el) ? $c(el) : $c['_root'];
    return { $: $x, data: Boolean(parse) ? walk($x) : null };
}

// export
module.exports = xhtml2js;

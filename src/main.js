// main module

const numberFormat = (number, decimals, decPoint, thousandsSep) => {
    decimals = isNaN(decimals) ? 1 : Math.abs(decimals);
    decPoint = (decPoint === undefined) ? '.' : decPoint;
    thousandsSep = (thousandsSep === undefined) ? '' : thousandsSep;
    const sign = number < 0 ? '-' : '';
    number = Math.abs(+number || 0);
    const intPart = parseInt(number.toFixed(decimals), 10) + '';
    const j = intPart.length > 3 ? intPart.length % 3 : 0;
    return ((''
        )+( sign
        )+( (j ? intPart.substr(0, j) + thousandsSep : '')
        )+( intPart.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousandsSep)
        )+( (decimals ? decPoint + Math.abs(number - intPart).toFixed(decimals).slice(2) : '')
    ));
}

const formatSize = (value, decimals) => {
    const units = [[1, 'B'], [1024, 'KiB'], [1024 * 1024, 'MiB'], [1024 * 1024 * 1024, 'GiB']];
    for (let i = 0; i < units.length - 1; i++) {
        if (value < units[i + 1][0]) {
            return numberFormat(value / units[i][0], decimals) + units[i][1];
        }
    }
    return numberFormat(value / units[units.length - 1][0], decimals) + units[units.length - 1][1];
}

const formatTime = (value) => {
    const totalSecondes = parseInt(value, 10);
    // count
    let days    = Math.floor(totalSecondes / 86400);
    let hours   = Math.floor((totalSecondes % 86400) / 3600);
    let minutes = Math.floor(((totalSecondes % 86400) % 3600) / 60);
    let seconds = totalSecondes % 60;
    // strings
    days    = days    > 0  ?  days + 'd' : '';
    hours   = Boolean(days   ||hours) ?
        days  + ((Boolean(days) &&hours  <10 ? '0' : '') + hours   + 'h') : '';
    minutes = Boolean(minutes||hours) ?
        hours + ((Boolean(hours)&&minutes<10 ? '0' : '') + minutes + 'm') : '';
    seconds = minutes + (Boolean(minutes)&&seconds<10 ? '0' : '') + seconds + 's';
    return seconds;
}

const typeOfSN = (str) => {
    return typeof str == 'string' || typeof str == 'number' ? true : false;
}

const updateLine = (text) => {
    const s = process.stderr;
    s.cursorTo(0);
    s.write(text);
    s.clearLine(1);
}

const uplStatus = (sendedBytes, totalBytes, startTime, prefixText) => {
    prefixText = typeof prefixText === 'string' ? prefixText : '[SEND]';
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const percentNumber = (sendedBytes / totalBytes * 100).toFixed();
    const percentString = percentNumber < 100 ? percentNumber : (totalBytes == sendedBytes ? 100 : 99);
    const timeLeft = formatTime(((parseInt(elapsedTime * (totalBytes / sendedBytes - 1))) / 1000).toFixed());
    if (sendedBytes < totalBytes) {
        updateLine([
            prefixText,
            `${formatSize(sendedBytes)}/${formatSize(totalBytes)}`,
            `[${percentString}%]`,
            `${timeLeft}`,
        ].join(' '));
    }
}

const uplStatus2 = (
        prefixText,
        startTime, totalBytes, 
        currentTime, sendedBytes, 
        sendSpeed
    ) => {
    prefixText = typeof prefixText === 'string' ? prefixText : '[SEND]';
    const elapsedTime = currentTime - startTime;
    const percentNumber = (sendedBytes / totalBytes * 100).toFixed();
    const percentString = percentNumber < 100 ? percentNumber : (totalBytes == sendedBytes ? 100 : 99);
    const timeLeft = formatTime(((parseInt(elapsedTime * (totalBytes / sendedBytes - 1))) / 1000).toFixed());
    if (sendedBytes < totalBytes) {
        updateLine([
            prefixText,
            `${formatSize(sendedBytes)}/${formatSize(totalBytes)}`,
            `[${percentString}%]`,
            `${timeLeft}`,
            `${sendSpeed}`,
        ].join(' '));
    }
}

const uplStatus2Speed = ( currentTime, sendedBytes, prevTime, prevBytes ) => {
    if( typeof prevTime === 'number' && typeof prevBytes === 'number' && prevTime > 0 && prevBytes > 0){
        return {
            sendSpeed: formatSize(( sendedBytes - prevBytes ) / (currentTime - prevTime) * 1024) + '/s',
            prevTime:  currentTime,
            prevBytes: sendedBytes,
        };
    }
    return { sendSpeed: '', prevTime: currentTime, prevBytes: sendedBytes };
}

const parseWinCmdLineParam = (p) => {
    let quote = false;
    let start = 0;
    const result = [];
    for (let i = 0; i < p.length; i++) {
        if (p[i] === ' ' && !quote) {
            if (start < i) {
                result.push(p.substring(start, i));
            }
            start = i + 1;
            continue;
        }
        if (p[i] !== '"') continue;
        if (quote) {
            result.push(p.substring(start, i));
            start = i + 2;
            quote = false;
            continue;
        }
        quote = true;
        start = i + 1;
    }
    if (start < p.length) {
        result.push(p.substring(start));
    }
    return result;
}

const cleanupFilename = (flnm) => {
    const fixingChar = '_';
    const illegalRe = /[\/\?<>\\:\*\|":]/g; // Illegal Characters on conscious Operating Systems: / ? < > \ : * | "
    const controlRe = /[\x00-\x1f\x80-\x9f]/g; // Unicode Control codes: C0 0x00-0x1f & C1 (0x80-0x9f)
    const reservedRe = /^\.+$/; // Reserved filenames on Unix-based systems (".", "..")
    const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    /*    Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
        "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
        "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
        "LPT9") case-insensitively and with or without filename extensions. */
    const windowsTrailingRe = /[\. ]+$/;
    flnm = flnm
        .replace(illegalRe, fixingChar)
        .replace(controlRe, fixingChar)
        .replace(reservedRe, fixingChar)
        .replace(windowsReservedRe, fixingChar)
        .replace(windowsTrailingRe, fixingChar);
    return flnm;
}

const dateString = (timestamp, noTimeStr) => {
    let timeStr = '';
    noTimeStr = Boolean(noTimeStr);
    if (timestamp === 0) {
        timeStr = noTimeStr ? '' : ' 00:00:00';
        return `0000-00-00${timeStr} UTC`;
    }
    const date = new Date(timestamp).toISOString()
    const dateStr = date.substring(0, date.indexOf('T'));
    if (!noTimeStr) {
        timeStr = ' ' + date.substring(date.indexOf('T')+1, date.indexOf('.'));
    }
    return `${dateStr}${timeStr} UTC`;
}

const exec = (pname, fpath, pargs, spc) => {
    pargs = pargs ? ' ' + pargs : '';
    spc   = Boolean(spc) ? '\n' : '';
    console.log(`\n> "${pname}"${pargs}${spc}`);
    require('child_process').execSync((fpath + pargs), { stdio: 'inherit' });
}

const validateNum = (input, min, max) => {
    const num = +input;
    return num >= min && num <= max && input === num.toString();
}

const validateIpAndPort = (input) => {
    const parts = input.split(':');
    const ip = parts[0].split('.');
    const port = parts[1];
    return parts.length == 2 && ip.length == 4 && validateNum(port, 1, 65535) && ip.every(segment => {
        return validateNum(segment, 0, 255);
    });
}

// extra modules

const cookie       = require('./module.cookie');
const question     = require('./module.question');
const ask          = require('./module.ask');
const xhtml2js     = require('./module.xhtml2js');

// export

module.exports = {
    // main list
    numberFormat,
    formatSize,
    formatTime,
    typeOfSN,
    updateLine,
    uplStatus,
    uplStatus2,
    uplStatus2Speed,
    parseWinCmdLineParam,
    cleanupFilename,
    dateString,
    exec,
    validateNum,
    validateIpAndPort, 
    // extra list
    cookie,
    question,
    ask,
    xhtml2js
};

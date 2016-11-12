module.exports = {
	numberFormat: function(number, decimals, decPoint, thousandsSep) {
		decimals = isNaN(decimals) ? 2 : Math.abs(decimals);
		decPoint = (decPoint === undefined) ? '.' : decPoint;
		thousandsSep = (thousandsSep === undefined) ? '' : thousandsSep;
		
		var sign = number < 0 ? '-' : '';
		number = Math.abs(+number || 0);
		
		var intPart = parseInt(number.toFixed(decimals), 10) + '';
		var j = intPart.length > 3 ? intPart.length % 3 : 0;
		
		return ((''
			)+( sign
			)+( (j ? intPart.substr(0, j) + thousandsSep : '')
			)+( intPart.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousandsSep)
			)+( (decimals ? decPoint + Math.abs(number - intPart).toFixed(decimals).slice(2) : '')
		));
	},
	hsize: function(value){
		var units = [[1, 'B'], [1024, 'KiB'], [1024*1024, 'MiB'], [1024*1024*1024, 'GiB']];
		for (var i=0; i<units.length-1; i++) {
			if (value < units[i+1][0]) {
				return this.numberFormat(value / units[i][0], 2) + units[i][1];
			}
		}
		return this.numberFormat(value / units[units.length-1][0], 2) + units[units.length-1][1];
	},
	htime: function(value){
		var sec_num = parseInt(value, 10);
		var days    = Math.floor(sec_num / 86400);
		var hours   = Math.floor((sec_num % 86400) / 3600);
		var minutes = Math.floor(((sec_num % 86400) % 3600) / 60);
		var seconds = ((sec_num % 86400) % 3600) % 60;
		days  = days  > 0 ? days+'d' : '';
		hours = hours > 0 || days !== '' ? ( hours < 10 && days !== '' ? '0'+hours+'h' : hours+'h') : '';
		minutes = minutes > 0 || hours !== '' ? (minutes < 10 && hours !== '' ? '0'+minutes+'m' : minutes+'m') : '';
		seconds = minutes !== '' && seconds < 10 ? '0'+seconds+'s' : seconds+'s';
		return (days+hours+minutes+seconds);
	},
	typeOfSN: function(str){
		return typeof str == 'string' || typeof str == 'number' ? true : false;
	},
	updLn: function(text){
		var s = process.stderr;
		s.cursorTo(0);
		s.write(text);
		s.clearLine(1);
	},
	uplStatus: function(ub,fsize,start_time){
		var elapsed = Date.now() - start_time;
		var percentFxd = (ub/fsize*100).toFixed();
		var percent = percentFxd < 100 ? percentFxd : 99;
		var time = this.htime(((parseInt(elapsed*(fsize/ub-1)))/1000).toFixed());
		if (ub < fsize){
			this.updLn('UPL: '+this.hsize(ub)+'/'+this.hsize(fsize)+' ['+percent+'%] '+time);
		}
	},
	parseWinCmdLineParam: function(p){
		var quote = false;
		var start = 0;
		var result = [];
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
};
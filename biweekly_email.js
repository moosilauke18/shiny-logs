var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var nodemailer = require('nodemailer'); var dir = '/var/log/shiny-daily/';
var items = [];

var parseLogs = function() {
	fs.readdir(dir, function(err,files) {
		if(err) throw err;
		files.forEach(function(file){
			var instream = fs.createReadStream(dir + file);
			var outstream = new stream;
			var rl = readline.createInterface(instream, outstream);
			var exists = false;
			var multiline = false;
			var first_line = "";
			rl.on('line',function(line) {
				// check if multiline
				if(multiline) {
					if(line.match(/^\s+/)) {
						first_line = first_line + " " + line;
					}else {
						items.filter(function(item) {
							if(item.string == first_line) {
								item.count++;
								exists = true;
							}
						});
						if(!exists) {
							items.push({'string':first_line,'count':1});
						}
						exists = false;
						multiline = false;
						first_line = '';
					}
				} 
				if(line.indexOf("error ") > -1 || line.indexOf("Error ") > -1) {
					if(!line.match(/^\s+/)) {
						if(line.match(/:\s*$/)) {
							multiline = true;
							first_line = line;
						}	
						if(!multiline) {
							items.filter(function(item) {
								if(item.string == line) {
									item.count++;
									exists = true;
								}
							});
							if(!exists) {
								items.push({'string':line,'count':1});
							
							}
							exists = false;
						}
					}
				}
			});

			rl.on('close', function() {
				email_content = "/tmp/shiny-email.txt"
				fs.writeFile(email_content, "From: gastrologs@gastrograph.com\r\nSubject: Log Summary\r\n", function(err) {
					if(err) throw err;
				});
				items.filter(function(item) {
					fs.appendFile(email_content, item.count + " = " + item.string + "\r\n", function(err) {
						if(err) throw err;
					});
				});

			});
		});
	});
}
parseLogs();

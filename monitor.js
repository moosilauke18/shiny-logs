  var Inotify = require('inotify').Inotify;
var fs = require('fs');
    var inotify = new Inotify(); //persistent by default, new Inotify(false) //no persistent

    var data = {}; //used to correlate two events

    var callback = function(event) {
        var mask = event.mask;
        var type = mask & Inotify.IN_ISDIR ? 'directory ' : 'file ';
        event.name ? type += ' ' + event.name + ' ': ' ';

        //the porpuse of this hell of 'if'
        //statements is only illustrative.

        if(mask & Inotify.IN_ACCESS) {
            console.log(type + 'was accessed ');
        } else if(mask & Inotify.IN_MODIFY) {
		if(event.name != 'access.log') {
			fs.readFile("/var/log/shiny-server/" + event.name, 'utf8', function(err, data){
				var date = new Date();
				fs.exists("/var/log/shiny-daily/shiny-log-" + date.getMonth() + date.getDate() + ".log", function(exists) {
					console.log("Hello");
					if(exists) {
						console.log("exists");
						fs.appendFile('/var/log/shiny-daily/shiny-log-' + date.getMonth() + date.getDate() + ".log", data, function(err) {
							console.log("appended");
							if(err) console.log(err);
						});
					} else {
						console.log("doesn't exist");
						fs.writeFile('/var/log/shiny-daily/shiny-log-' + date.getMonth() + date.getDate() + ".log", data, function(err) {
							console.log("writen");
							if(err) console.log(err);
						});
					}
				});
			});	
		}
        } else if(mask & Inotify.IN_OPEN) {
            console.log(type + 'was opened ');
        } else if(mask & Inotify.IN_CLOSE_NOWRITE) {
            console.log(type + ' opened for reading was closed ');
        } else if(mask & Inotify.IN_CLOSE_WRITE) {
            console.log(type + ' opened for writing was closed ');
        } else if(mask & Inotify.IN_ATTRIB) {
            console.log(type + 'metadata changed ');
        } else if(mask & Inotify.IN_CREATE) {
            console.log(type + 'created');
        } else if(mask & Inotify.IN_DELETE) {
            console.log(type + 'deleted');
        } else if(mask & Inotify.IN_DELETE_SELF) {
            console.log(type + 'watched deleted ');
        } else if(mask & Inotify.IN_MOVE_SELF) {
            console.log(type + 'watched moved');
        } else if(mask & Inotify.IN_IGNORED) {
            console.log(type + 'watch was removed');
        } else if(mask & Inotify.IN_MOVED_FROM) {
            data = event;
            data.type = type;
        } else if(mask & Inotify.IN_MOVED_TO) {
            if( Object.keys(data).length &&
                data.cookie === event.cookie) {
                console.log(type + ' moved to ' + data.type);
                data = {};
            }
        }
    }
    var home_dir = { path:      '/var/log/shiny-server', // <--- change this for a valid directory in your machine.
                     watch_for: Inotify.IN_CREATE | Inotify.IN_MODIFY,
                     callback:  callback
                  };

    var home_watch_descriptor = inotify.addWatch(home_dir);


var loopback = require('loopback');
var cluster = require('cluster');
var boot = require('loopback-boot');
var fs = require('fs'); //**fs: Handle file system**
var http = require('http');
var https = require('https');

var app = module.exports = loopback();

/*
app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
*/

/*
app.httpsStart = function() {
    // start the web server
    var ssl_options = {
        pfx: fs.readFileSync('key/star_redimed_com_au.pfx'),
        passphrase: '1234'
    }; //**SSL file and passphrase use for server
    var server = https.createServer(ssl_options, app);
    server.listen(app.get('port'), function() {
        var baseUrl = 'https://' + app.get('host') + ':' + app.get('port');
        app.emit('started', baseUrl);
        console.log('LoopBack server listening @ %s%s', baseUrl, '/');
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s' + 'process = ' + process.pid, baseUrl, explorerPath);
        }
    });
    return server;
};


// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.

boot(app, __dirname, function(err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module){
        //app.httpsStart()
        app.io = require('socket.io')(app.httpsStart());

        app.io.on('connection', function(socket){
          console.log('a user connected');
          socket.on('disconnect', function(){
              console.log('user disconnected');
          });
          socket.on('msg', function(msg){
              console.log('received msg from client = ',msg);
          });
        });
    }
});*/


var express = require('express'),
    net = require('net'),
    sio = require('socket.io'),
    sio_redis = require('socket.io-redis');
//var ClusterStore = require('strong-cluster-socket.io-store')(sio);

app.httpsStart = function() {
    // start the web server
    var ssl_options = {
        pfx: fs.readFileSync('key/star_redimed_com_au.pfx'),
        passphrase: '1234'
    }; //**SSL file and passphrase use for server

    var server = https.createServer(ssl_options, app);
    server.listen( 0 , function() {
        var baseUrl = 'https://' + app.get('host') + ':' + app.get('port');
        app.emit('started', baseUrl);
        console.log('LoopBack server listening @ '+baseUrl+'/ processid='+process.pid);

        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;

            console.log('Browse your REST API at ' + baseUrl + explorerPath);
        }
    });

    ///socket.io
    // Here you might use middleware, attach routes, etc.
    var io = sio(server);

    // Tell Socket.IO to use the redis adapter. By default, the redis
    // server is assumed to be on localhost:6379. You don't have to
    // specify them explicitly unless you want to change them.
    //io.adapter(sio_redis({ host: 'localhost', port: 6379 }));

    // Here you might use Socket.IO middleware for authorization etc.

    // Listen to messages sent from the master. Ignore everything else.
    process.on('message', function(message, connection) {
        if (message !== 'sticky-session:connection') {
            return;
        }

        // Emulate a connection event on the server by emitting the
        // event with the connection the master sent us.
        server.emit('connection', connection);

        connection.resume();
    });

    io.on('connection', function(socket) {
        // Use socket to communicate with this particular client only, sending it it's own id

        socket.emit('welcome', { message: 'Welcome!', id: socket.id });
        socket.on('msg', function(data) {
            console.log(process.pid , data);
        });

        socket.on('APPOINTMENT_RESERVE', function(data) {
            console.log(process.pid , data);
            var reservedObject = {
              reserveId: 0,
              calendarId: data.calendar.calendarId
            };

            app.models.BAppointmentReserves.create(reservedObject,function(err,data){
              console.log("inserted into reserved table:",err,data);
            });

            socket.broadcast.emit('APPOINTMENT_RESERVE',data.calendar);
        });

        socket.on('disconnect', function(){
            console.log('user disconnected socket.id = ',socket.id );
        });
    });

    return server;
};



var port = 3001,
    num_processes = require('os').cpus().length;

if (cluster.isMaster) {
    // This stores our workers. We need to keep them to be able to reference
    // them based on source IP address. It's also useful for auto-restart,
    // for example.
    var workers = [];

    // Helper function for spawning worker at index 'i'.
    var spawn = function(i) {
        workers[i] = cluster.fork();

        // Optional: Restart worker on exit
        workers[i].on('exit', function(worker, code, signal) {
            console.log('respawning worker', i);
            spawn(i);
        });
    };

    // Spawn workers.
    for (var i = 0; i < num_processes; i++) {
        spawn(i);
    }

    // Helper function for getting a worker index based on IP address.
    // This is a hot path so it should be really fast. The way it works
    // is by converting the IP address to a number by removing the dots,
    // then compressing it to the number of slots we have.
    //
    // Compared against "real" hashing (from the sticky-session code) and
    // "real" IP number conversion, this function is on par in terms of
    // worker index distribution only much faster.

    var worker_index = function(ip, len) {
        var s = '';
        for (var i = 0, _len = ip.length; i < _len; i++) {
            if (ip[i] !== '.' && ip[i] !== ':' && ip[i] !== 'f') {
                s += ip[i];
            }
        }
        var number = Number(s);
        if(number){
            return Number(s) % len;
        }else{
            return 1;
        }


    };

    // Create the outside facing server listening on our port.
    var server = net.createServer({ pauseOnConnect: true }, function(connection) {
        // We received a connection and need to pass it to the appropriate
        // worker. Get the worker for this connection's source IP and pass
        // it the connection.
        console.log("\n\nconnection coming.....",connection.remoteAddress,' worker_index = ',worker_index(connection.remoteAddress, num_processes));
        var worker = workers[worker_index(connection.remoteAddress, num_processes)];
        worker.send('sticky-session:connection', connection);
    }).listen(port,function(){
        console.log("Master process is running............... at port " + port);
    });
} else {

    boot(app, __dirname, function(err) {
        if (err) throw err;

        // start the server if `$ node server.js`
        if (require.main === module)
            app.httpsStart();
    });

}

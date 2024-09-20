var webSocket = require("websocket").w3cwebsocket;
var fs = require("fs");
var jpointer = require("json-pointer");
var https = require("https");
var http = require("http");

var pckg = require("./package.json");

// System config loading
var properties = require("./config/app-config.json");
var httpPort = properties.port.http;
var httpsPortP = properties.port.https;
var key = properties.path.key;
var cert = properties.path.cert;

// Services configuration file
var servicesConfig = require("./config/services.json");

// This function validates the JSON schemas
var Ajv = require("ajv"); 
const addFormats = require("ajv-formats");
validateJsonSchemas();

// Prepare the languages array to give to the clients
var languagesData = getLanguages();

var server = http.createServer();

var enableHTTPS = false;

if (key.length !== 0 && cert.length !== 0) {
    enableHTTPS = true;

    var options = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert),
    };

    var secureServer = https.createServer(options);
}

var io = require("socket.io")({
    cors: {
        origin: true,
    },
});

io.attach(server);
if (enableHTTPS) {
    io.attach(secureServer);
}

io.sockets.on("connection", (client) => {
    // Wait for the incoming connection from the browser, the Socket.io client from index.html
    print_log("Opened connection");

    client.on("getLanguages", () => {
        print_log('Executed "getLanguages"');
        client.emit("languages", JSON.stringify(languagesData));
    });

    client.on("run", (data) => {
        // Wait for the incoming data with the 'run' event and send data
        print_log('Executed "run"');

        // The function return the host path of one of the executors for a particular language and solver, if know
        var host = getExcecutorURL(data);

        // Check if the choosen host is configured
        if (host === undefined) {
            client.emit("problem", {
                reason: "No Executor available for this solver!",
            });
            return;
        }

        // Connect to the executor
        var executor = new webSocket(host);

        print_log('Connecting to "' + host + '"');

        executor.onopen = () => {
            // Opens the connection and send data
            print_log(
                "Sending to EmbASPServerExecutor:\n" +
                    JSON.stringify(JSON.parse(data), null, "\t")
            );
            executor.send(data);
        };

        executor.onerror = (error) => {
            print_log(
                "WebSocket problem:\n" + JSON.stringify(error, null, "\t")
            );
            client.emit("problem", {
                reason: "Execution error, please try again later!",
            });
        };

        executor.onmessage = (output) => {
            // Wait for the incoming data from the EmbASPServerExecutor
            var model = JSON.parse(output.data);
            print_log(
                'From EmbASPServerExecutor:\nModel "' +
                    model.model +
                    '"\nError "' +
                    model.error +
                    '"'
            ); // debug string
            client.emit("output", model); // Socket.io calls emit() to send data to the browser.
        };
    });
});

if (enableHTTPS) {
    secureServer.listen(httpsPortP, function () {
        print_log("Loide API Server listening on secure port " + httpsPortP);
        print_log("Version: " + pckg.version);
    });
}

server.listen(httpPort, function () {
    print_log("Loide API Server listening on port " + httpPort);
    print_log("Version: " + pckg.version);
});

function print_log(statement) {
    console.log("%s: %s", new Date().toLocaleString(), statement); // debug string
}

function getExcecutorURL(data) {
    console.log("data getExcecutorURL", data);
    try {
        data = JSON.parse(data);
    } catch (error) {
        return undefined;
    }
    for (var i in servicesConfig.languages) {
        if (servicesConfig.languages[i].value === data.language) {
            var solvers = servicesConfig.languages[i].solvers;
            for (var j in solvers) {
                // FIXME: The client should pass 'solver' parameter and not 'engine'
                if (solvers[j].value === data.engine) {
                    var executors = solvers[j].executors;
                    for (var k in executors) {
                        if (executors[k].value === data.executor) {
                            return (
                                executors[k].protocol +
                                "://" +
                                executors[k].url +
                                ":" +
                                executors[k].port +
                                executors[k].path
                            );
                        }
                    }
                }
            }
        }
    }
    return undefined;
}

function validateJsonSchemas() {
    // Validate JSON file with the relative scheme
    var servicesValidation = validateSchema(
        "./config/services.json",
        "./config/services-schema.json"
    );
    var appConfigValidation = validateSchema(
        "./config/app-config.json",
        "./config/app-config-schema.json"
    );

    if (servicesValidation.criticalError || appConfigValidation.criticalError) {
        console.log(
            "Fatal error: configuration files are not setted up properly!"
        );
        process.exit(1);
    }
}

function validateSchema(jsonPath, schemaPath) {
    // Loading files
    var json = require(jsonPath);
    var schema = require(schemaPath);

    // Config
    var ajv = new Ajv({
        allErrors: true,
    });
    addFormats(ajv);

    // Compiling the schema
    var compiledSchema = ajv.compile(schema);
    var validated = false;
    var printError = true;
    var response = {};

    while (!validated) {
        // Validating
        var validatedJson = compiledSchema(json);
        // If some there is some error, the nearest parent object in the file, containing this error, is deleted
        if (!validatedJson) {
            // Prints the errors only the first time
            if (printError) {
                console.log(compiledSchema.errors);
                printError = false;
            }

            for (var index in compiledSchema.errors) {
                var path = compiledSchema.errors[index].dataPath;
                if (path === "") {
                    // 'This' case happen when there is a problem in to the root of the json file (eg. when the file is empty)
                    console.log(
                        "Fatal error: " +
                            jsonPath +
                            " is not setted up properly!"
                    );
                    response.criticalError = true;
                    validated = true;
                } else {
                    jpointer.remove(json, path);
                }
            }
        } else {
            console.log("Validated: " + jsonPath);
            validated = true;
        }
    }

    return response;
}

function getLanguages() {
    // get a copy of languages from the services JSON
    let languages = JSON.parse(JSON.stringify(servicesConfig.languages));

    for (let i = 0; i < languages.length; i++) {
        for (let j = 0; j < languages[i].solvers.length; j++) {
            for (let x = 0; x < languages[i].solvers[j].executors.length; x++) {
                let executor = languages[i].solvers[j].executors[x];
                languages[i].solvers[j].executors[x] = {
                    name: executor.name,
                    value: executor.value,
                };
            }
        }
    }

    return languages;
}

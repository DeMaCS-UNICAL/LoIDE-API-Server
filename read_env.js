require('dotenv').config();
const fs = require('fs');

let servicesData = JSON.parse(fs.readFileSync('./config/services.json', 'utf8'));

servicesData.languages.forEach(language => {
    language.solvers.forEach(solver => {
        solver.executors.forEach(executor => {
            executor.url = process.env.ESE_URL || "127.0.0.1";
            executor.port = parseInt(process.env.ESE_PORT) || parseInt("12345");
        });
    });
});

fs.writeFile('./config/services.json', JSON.stringify(servicesData, null, 2), (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('Services data written successfully');
    }
});

let appConfigData = JSON.parse(fs.readFileSync('./config/app-config.json', 'utf8'));

appConfigData.port.http = parseInt(process.env.LISTENING_HTTP_PORT, 10) || 8084;
appConfigData.port.https = parseInt(process.env.LISTENING_HTTPS_PORT, 10) || 8085;

fs.writeFile('./config/app-config.json', JSON.stringify(appConfigData, null, 2), (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('App data written successfully');
    }
});
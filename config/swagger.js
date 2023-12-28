const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        version: "1.0.0",
        title: "Billing Management System",
        description: "Billing Management System API Documentation",
        contact: {
            name: "Santosh",
            email: "smartsantosh1928@gmail.com"
        }
    },
    host: "localhost:3000",
    schemes: ['http'],
}

const outputFile = './swagger_output.json';
const endpointsFiles = ['../routes/*.js',];

swaggerAutogen(outputFile, endpointsFiles).then(() => {
    require('../index.js');
});
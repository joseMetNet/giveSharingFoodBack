import swaggerJsDoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'giveSharingFood Backend',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:8080/givesharingfood',
                description: 'Local server',
            },
            {
                url: 'https://givesharingfoodbackend.azurewebsites.net/givesharingfood',
                description: 'Production server',
            },
        ],
        tags: [
            {
                name: 'Products',
                description: 'Operations related to products',
            },
            {
                name: 'Users',
                description: 'Operations related to users',
            },
            {
                name: 'Type Identifications',
                description: 'Operations related to type identificantions'
            },
            {
                name: 'Qualifications',
                description: 'Operations related to qualifications'
            },
            {
                name: 'Measures',
                description: 'Operations related to qualifications'
            },
            {
                name: 'Login',
                description: 'Operations related to login'
            },
            {
                name: 'Departments',
                description: 'Operations related to departments'
            },
            {
                name: 'Cities',
                description: 'Operations related to cities'
            },
            {
                name: 'Documents',
                description: 'Operations related to documents'
            },
            {
                name: 'Organizations',
                description: 'Operations related to organizations'
            }
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs, swaggerUi };
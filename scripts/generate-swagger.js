// scripts/generate-swagger.js
import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Respos API Documentation',
            version: '1.0.0',
            description: 'API Documentation with detailed specifications',
            contact: {
                name: 'API Support',
                email: 'support@yourdomain.com'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

fs.writeFileSync(
    path.resolve(__dirname, '../dist/swagger.json'),
    JSON.stringify(swaggerSpec, null, 2)
);

console.log('Swagger JSON generated successfully.');
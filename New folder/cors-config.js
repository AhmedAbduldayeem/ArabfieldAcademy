// cors-config.js
const CorsConfig = {
    allowedOrigins: [
        'https://arabfieldacademy.netlify.app',
        'https://www.arabfieldacademy.com',
        'http://localhost:3000'
    ],
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
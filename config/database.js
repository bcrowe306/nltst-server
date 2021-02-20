module.exports = ({ env }) => ({
    defaultConnection: 'default',
    connections: {
        default: {
            connector: 'bookshelf',
            settings: {
                client: 'postgres',
                host: env('DATABASE_HOST', 'localhost'),
                port: env.int('DATABASE_PORT', 5432),
                database: env('DATABASE_NAME', 'strapi'),
                username: env('DATABASE_USERNAME', 'strapi'),
                password: env('DATABASE_PASSWORD', 'strapitest'),
                // ssl: {
                //     rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false), // For self-signed certificates
                // },
                // sqlite
                // client: 'sqlite',
                // filename: env('DATABASE_FILENAME', '.tmp/data.db'),
            },
            options: {
                // useNullAsDefault: true,
                ssl: env.bool('DATABASE_SSL', false),
            },
        },
    },
});
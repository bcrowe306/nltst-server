const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

const sanitizeUser = user =>
    sanitizeEntity(user, {
        model: strapi.query('user', 'users-permissions').model,
    });

const formatError = error => [
    { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

module.exports = {
    async create(ctx) {
        const advanced = await strapi
            .store({
                environment: '',
                type: 'plugin',
                name: 'users-permissions',
                key: 'advanced',
            })
            .get();

        const { email, username, password, role } = ctx.request.body;

        if (!email) return ctx.badRequest('missing.email');
        if (!username) return ctx.badRequest('missing.username');
        if (!password) return ctx.badRequest('missing.password');

        const userWithSameUsername = await strapi
            .query('user', 'users-permissions')
            .findOne({ username });

        if (userWithSameUsername) {
            return ctx.badRequest(
                null,
                formatError({
                    id: 'Auth.form.error.username.taken',
                    message: 'Username already taken.',
                    field: ['username'],
                })
            );
        }

        if (advanced.unique_email) {
            const userWithSameEmail = await strapi
                .query('user', 'users-permissions')
                .findOne({ email: email.toLowerCase() });

            if (userWithSameEmail) {
                return ctx.badRequest(
                    null,

                    formatError({
                        id: 'Auth.form.error.email.taken',
                        message: 'Email already taken.',
                        field: ['email'],
                    })
                );
            }
        }

        const user = {
            ...ctx.request.body,
            provider: 'local',
        };

        user.email = user.email.toLowerCase();

        if (!role) {
            const defaultRole = await strapi
                .query('role', 'users-permissions')
                .findOne({ type: advanced.default_role }, []);

            user.role = defaultRole.id;
        }

        try {
            const data = await strapi.plugins['users-permissions'].services.user.add(user);

            // Custom code to auto create a profile
            let profile_data = {};
            profile_data.user = data.id
            await strapi.services.profile.create(profile_data);

            ctx.created(sanitizeUser(data));
        } catch (error) {
            ctx.badRequest(null, formatError(error));
        }
    },
}
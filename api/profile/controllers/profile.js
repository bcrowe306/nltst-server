'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async findMe(ctx) {
        const entity = await strapi.services.profile.findOne({ user: ctx.state.user.id });
        return sanitizeEntity(entity, { model: strapi.models.profile });
    },
    async updateMe(ctx) {

        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.services.profile.update({ user: ctx.state.user.id }, data, {
                files,
            });
        } else {
            entity = await strapi.services.profile.update({ user: ctx.state.user.id }, ctx.request.body);
        }

        return sanitizeEntity(entity, { model: strapi.models.profile });
    },
};
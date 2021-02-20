'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            ctx.request.body.author = ctx.state.user.id
            entity = await strapi.services.post.create(data, { files });
        } else {
            ctx.request.body.author = ctx.state.user.id
            entity = await strapi.services.post.create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models.post });
    },
    async like(ctx) {
        let entity;
        let body = {};
        body.user = ctx.state.user.id
        body.post = ctx.params.id

        const like = await strapi.services['post-like'].findOne(body);
        if (like) {
            const en = await strapi.services['post-like'].delete(body)
            return sanitizeEntity(en, { model: strapi.models['post-like'] });
        } else {
            entity = await strapi.services['post-like'].create(body);
            return sanitizeEntity(entity, { model: strapi.models['post-like'] });
        }
    },
};
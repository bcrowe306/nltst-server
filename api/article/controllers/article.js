'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async find(ctx) {
        let entities;
        if (ctx.query._q) {
            entities = await strapi.services.article.search(ctx.query);
        } else {
            entities = await strapi.services.article.find(ctx.query);
        }

        return await Promise.all(
            entities.map(async entity => {
                // Calculate Rating
                var rates = await strapi.services.rating.find({ article: entity.id })
                var rating = 0;
                if (rates.length > 0) {
                    rating = parseInt(rates.reduce((acc, curr) => acc + curr.value, 0)) / rates.length
                }
                entity.rating = rating

                // Calculate Like Count
                var likes = await strapi.services.like.find({ article: entity.id })
                entity.like_count = likes.length || 0;

                // Return
                return sanitizeEntity(entity, { model: strapi.models.article })
            })
        )
    },
    async findOne(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.services.article.findOne({ id });

        // Calculate Rating
        var rates = await strapi.services.rating.find({ article: ctx.params.id })
        var rating = 0;
        if (rates.length > 0) {
            rating = parseInt(rates.reduce((acc, curr) => acc + curr.value, 0)) / rates.length
        }
        entity.rating = rating

        // Calculate Like Count
        var likes = await strapi.services.like.find({ article: ctx.params.id })
        entity.like_count = likes.length || 0;

        // Calculate is_liked
        var is_liked_record = await strapi.services.like.find({ article: ctx.params.id, user: ctx.state.user.id })
        entity.is_liked = is_liked_record.length > 0 ? true : false;

        // Return
        return sanitizeEntity(entity, { model: strapi.models.article });
    },
    async like(ctx) {
        let entity;
        let body = {};
        body.user = ctx.state.user.id
        body.article = ctx.params.id

        const like = await strapi.services.like.findOne(body);
        if (like) {
            const en = await strapi.services.like.delete(body)
            return sanitizeEntity(en, { model: strapi.models.like });
        } else {
            entity = await strapi.services.like.create(body);
            return sanitizeEntity(entity, { model: strapi.models.like });
        }
    },
    async favorite(ctx) {
        let entity;
        let body = {};
        body.user = ctx.state.user.id
        body.article = ctx.params.id

        const favorite = await strapi.services['favorite-article'].findOne(body);
        if (favorite) {
            const en = await strapi.services['favorite-article'].delete(body)
            return sanitizeEntity(en, { model: strapi.models['favorite-article'] });
        } else {
            entity = await strapi.services['favorite-article'].create(body);
            return sanitizeEntity(entity, { model: strapi.models['favorite-article'] });
        }
    },
    async comment(ctx) {
        let entity;
        ctx.request.body.author = ctx.state.user.id
        ctx.request.body.article = ctx.params.id
        entity = await strapi.services.comment.create(ctx.request.body);
        return sanitizeEntity(entity, { model: strapi.models.comment });
    },
    async rate(ctx) {
        let entity;
        ctx.request.body.user = ctx.state.user.id
        ctx.request.body.article = ctx.params.id

        // Search for existing rating
        var rating = await strapi.services.rating.findOne(ctx.request.body);

        if (rating) {
            entity = strapi.services.rating.update(ctx.params.id, ctx.request.body)
            return sanitizeEntity(entity, { model: strapi.models.rating });
        } else {
            entity = strapi.services.rating.create(ctx.request.body)
            return sanitizeEntity(entity, { model: strapi.models.rating });
        }
    }
};
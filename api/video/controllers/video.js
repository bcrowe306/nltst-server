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
            entities = await strapi.services.video.search(ctx.query);
        } else {
            entities = await strapi.services.video.find(ctx.query);
        }

        return await Promise.all(
            entities.map(async entity => {
                // Calculate Rating
                var rates = await strapi.services['video-rating'].find({ video: entity.id })
                var rating = 0;
                if (rates.length > 0) {
                    rating = parseInt(rates.reduce((acc, curr) => acc + curr.value, 0)) / rates.length
                }
                entity.rating = rating

                // Calculate Like Count
                var likes = await strapi.services['video-like'].find({ video: entity.id })
                entity.like_count = likes.length || 0;

                // Return
                return sanitizeEntity(entity, { model: strapi.models.video })
            })
        )
    },
    async findOne(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.services.video.findOne({ id });
        var rates = await strapi.services['video-rating'].find({ video: ctx.params.id })
        var rating = 0;
        if (rates.length > 0) {
            rating = parseInt(rates.reduce((acc, curr) => acc + curr.value, 0)) / rates.length
        }

        entity.rating = rating

        // Calculate Like Count
        var likes = await strapi.services['video-like'].find({ video: ctx.params.id })
        entity.like_count = likes.length || 0;

        // Calculate is_liked
        var is_liked_record = await strapi.services['video-like'].find({ video: ctx.params.id, user: ctx.state.user.id })
        entity.is_liked = is_liked_record.length > 0 ? true : false;

        return sanitizeEntity(entity, { model: strapi.models.video });
    },
    async like(ctx) {
        let entity;
        let body = {};
        body.user = ctx.state.user.id
        body.video = ctx.params.id

        const like = await strapi.services['video-like'].findOne(body);
        if (like) {
            const en = await strapi.services['video-like'].delete(body)
            return sanitizeEntity(en, { model: strapi.models['video-like'] });
        } else {
            entity = await strapi.services['video-like'].create(body);
            return sanitizeEntity(entity, { model: strapi.models['video-like'] });
        }
    },
    async favorite(ctx) {
        let entity;
        let body = {};
        body.user = ctx.state.user.id
        body.video = ctx.params.id

        const favorite = await strapi.services['favorite-video'].findOne(body);
        if (favorite) {
            const en = await strapi.services['favorite-video'].delete(body)
            return sanitizeEntity(en, { model: strapi.models['favorite-video'] });
        } else {
            entity = await strapi.services['favorite-video'].create(body);
            return sanitizeEntity(entity, { model: strapi.models['favorite-video'] });
        }
    },
    async comment(ctx) {
        let entity;
        ctx.request.body.user = ctx.state.user.id
        ctx.request.body.video = ctx.params.id
        entity = await strapi.services['video-comment'].create(ctx.request.body);
        return sanitizeEntity(entity, { model: strapi.models['video-comment'] });
    },
    async rate(ctx) {
        let entity;
        ctx.request.body.user = ctx.state.user.id
        ctx.request.body.video = ctx.params.id

        // Search for existing rating
        var rating = await strapi.services['video-rating'].findOne(ctx.request.body);

        if (rating) {
            entity = strapi.services['video-rating'].update(ctx.params.id, ctx.request.body)
            return sanitizeEntity(entity, { model: strapi.models['video-rating'] });
        } else {
            entity = strapi.services['video-rating'].create(ctx.request.body)
            return sanitizeEntity(entity, { model: strapi.models['video-rating'] });
        }
    }
};
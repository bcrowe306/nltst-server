module.exports = async(ctx, next) => {
    if (ctx.state.user) {

        entity = await strapi.services.comment.findOne({ user: ctx.state.user.id, id: ctx.params.id })
        if (entity) {
            return await next();
        } else {
            ctx.unauthorized(`You can only delete your own comment.`);
        }
        // Go to next policy or will reach the controller's action.
    } else {
        ctx.unauthorized(`You're not logged in!`);
    }
};
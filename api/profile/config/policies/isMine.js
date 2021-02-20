module.exports = async(ctx, next) => {
    if (ctx.state.user) {

        entity = await strapi.services.profile.findOne({ user: ctx.state.user.id })
        if (entity) {
            return await next();
        } else {
            ctx.unauthorized(`You can only edit your profile.`);
        }
        // Go to next policy or will reach the controller's action.
    } else {
        ctx.unauthorized(`You're not logged in!`);
    }
};
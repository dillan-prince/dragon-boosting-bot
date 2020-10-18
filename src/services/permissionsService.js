export const hasPermission = (message, permittedRoles) => {
    const authorRoles = message.channel.guild.members.cache
        .get(message.author.id)
        ._roles.map(
            (roleId) => message.channel.guild.roles.cache.get(roleId).name
        );

    return permittedRoles.some((permittedRole) =>
        authorRoles.includes(permittedRole)
    );
};

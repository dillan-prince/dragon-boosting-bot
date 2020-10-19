export const getServerUsername = (message, userId) => {
    const member = message.guild.members.cache.get(userId);
    return member.nickname || member.user.username;
};

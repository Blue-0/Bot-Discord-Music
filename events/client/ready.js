const { Events, ActivityType } = require("discord.js");

module.exports = {
    
    name: Events.ClientReady,
    async run(client) {

        await client.application.commands.set(client.commands.map(command => command.data));
        console.log("[SlashCommands] => loaded");

        client.user.setActivity("Un truc random", {type: ActivityType.Watching});
        
        console.log(`[Bot] => ${client.user.username} is Online`);


    }
};
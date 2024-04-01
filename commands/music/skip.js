const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {

data: new SlashCommandBuilder()
.setName("skip")
.setDescription("Passer la musique actuelle")
.setDMPermission(false)
.setDefaultMemberPermissions(null),

    async run(interaction) {
        
        const queue = useQueue(interaction.guild.id);
        if(!queue || !queue.isPlaying()) return await interaction.reply("Le bot ne joue pas de musique.");
        if(!queue.history.nextTrack) return await interaction.reply("Il n'y a pas de musique à jouée après celle-ci.");

        const voiceChannelMember = interaction.member.voice.channel;
        const voiceChannelBot = (await interaction.guild.members.fetchMe()).voice.channel;
        if(!voiceChannelMember) return await interaction.followUp("Tu n'est pas dans un channel.");
        if(voiceChannelBot && voiceChannelBot.id !== voiceChannelMember.id) return await interaction.followUp ("Tu n'est pas dans le même channel que le Bot.");
        
       queue.node.skip();
       if(interaction.client.blindtests.get(interaction.guildId)) interaction.client.blindtests.get(interaction.guildId).count++;
       await interaction.reply(`La musique \`${queue.currentTrack.title}\` est passée !`);
    }

};
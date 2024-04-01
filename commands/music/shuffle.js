const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {

data: new SlashCommandBuilder()
.setName("aleatoire")
.setDescription("Mélanger la file d'attente.")
.setDMPermission(false)
.setDefaultMemberPermissions(null),

    async run(interaction) {
        
        const queue = useQueue(interaction.guild.id);
        if(!queue || !queue.isPlaying()) return await interaction.reply("Le bot ne joue pas de musique.");
        if(queue.tracks.data.length < 2) return await interaction.reply("Il faut plus de 2 musiques pour lancer une lecture aléatiore des titres.");

        const voiceChannelMember = interaction.member.voice.channel;
        const voiceChannelBot = (await interaction.guild.members.fetchMe()).voice.channel;
        if(!voiceChannelMember) return await interaction.followUp("Tu n'est pas dans un channel.");
        if(voiceChannelBot && voiceChannelBot.id !== voiceChannelMember.id) return await interaction.followUp ("Tu n'est pas dans le même channel que le Bot.");

        queue.tracks.shuffle();
        await interaction.reply("Lecture aléatiore de la file d'attente !")
    
    }

};
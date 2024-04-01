const { SlashCommandBuilder } = require("discord.js");

module.exports = {

data: new SlashCommandBuilder()
.setName("play")
.setDescription("Jouer de la musique ")
.setDMPermission(false)
.setDefaultMemberPermissions(null)
.addStringOption(opt => opt.setName("song").setDescription("The song to play").setRequired(true)),

    async run(interaction) {
        
        await interaction.deferReply({ephemeral: true});
        const song = interaction.options.getString("song");

        const voiceChannelMember = interaction.member.voice.channel;
        const voiceChannelBot = (await interaction.guild.members.fetchMe()).voice.channel;
        if(!voiceChannelMember) return await interaction.followUp("Tu n'est pas dans un channel.");
        if(voiceChannelBot && voiceChannelBot.id !== voiceChannelMember.id) return await interaction.followUp ("Tu n'est pas dans le même channel que le Bot.")

        // try {

        const { track } = await interaction.client.player.play(voiceChannelMember, song, {
            requestedBy: interaction.user,
            nodeOptions: {
                metadata: interaction,
                volume: 10,
                leaveOnStop: false,
                LeaveOnEmpty: false,
                leaveOnEnd: false,
                selfDeaf: true,
            }
        });
        await interaction.followUp(`\`${track.title}\`during\`${track.duration}\` est ajoutée à la file d'attente.`)
        
        // } catch (err) {

        //     return await interaction.followUp(`La musique \`${song}\` n'a pas été trouvée.`)

        // };
    }

};
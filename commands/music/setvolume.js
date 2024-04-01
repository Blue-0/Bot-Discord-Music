const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {

data: new SlashCommandBuilder()
.setName("setvolume")
.setDescription("Regler le volume")
.setDMPermission(false)
.setDefaultMemberPermissions(null)
.addNumberOption(opt => opt.setName("volume").setDescription("Le volume requis").setRequired(true).setMaxValue(50).setMinValue(1)),

    async run(interaction) {
        
        const queue = useQueue(interaction.guild.id);
        if(!queue || !queue.isPlaying()) return await interaction.reply("Le bot ne joue pas de musique.");
        

        const voiceChannelMember = interaction.member.voice.channel;
        const voiceChannelBot = (await interaction.guild.members.fetchMe()).voice.channel;
        if(!voiceChannelMember) return await interaction.followUp("Tu n'est pas dans un channel.");
        if(voiceChannelBot && voiceChannelBot.id !== voiceChannelMember.id) return await interaction.followUp ("Tu n'est pas dans le même channel que le Bot.");

        const volume = interaction.options.getNumber("volume");
        if(queue.node.volume === volume) return await interaction.reply(`Le volume est déjà à \`${queue.node.volume}%\`.`);
        
        await interaction.reply(`Le volume est passé de \`${queue.node.volume}%\ à \`${volume}%\`.`);
        queue.node.setVolume(volume);

    }

};
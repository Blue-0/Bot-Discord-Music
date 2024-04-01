const { useQueue, QueueRepeatMode } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {

data: new SlashCommandBuilder()
.setName("boucle")
.setDescription("lire en boucle la file d'attente.")
.setDMPermission(false)
.setDefaultMemberPermissions(null)
.addStringOption(opt => opt.setName("option").setDescription("La boucle est activée").setRequired(true).addChoices({name: "track", value: "track"}, {name: "queue", value: "queue"})),


    async run(interaction) {
        
        const queue = useQueue(interaction.guild.id);
        if(!queue || !queue.isPlaying()) return await interaction.reply("Le bot ne joue pas de musique.");
        if(!queue.history.nextTrack) return await interaction.reply("Il n'y a pas de musique après celle-ci.");

        const voiceChannelMember = interaction.member.voice.channel;
        const voiceChannelBot = (await interaction.guild.members.fetchMe()).voice.channel;
        if(!voiceChannelMember) return await interaction.followUp("Tu n'est pas dans un channel.");
        if(voiceChannelBot && voiceChannelBot.id !== voiceChannelMember.id) return await interaction.followUp ("Tu n'est pas dans le même channel que le Bot.");

        const option = interaction.options.getString("option");
        if(option !== "track" && option !== "queue") return await interaction.reply("Tu n'as pas indiqué \`queue\` ou \`track\`.")

        switch (option) {
            case "track":
                if(queue.repeatMode === 0){
                    queue.setRepeatMode(QueueRepeatMode.TRACK);
                    await interaction.reply(`Ta musique va être lu en boucle !`)
                }   else{
                    queue.setRepeatMode(QueueRepeatMode.OFF);
                    await interaction.reply(`Ta musique ne va plus être lu en boucle !`)
                }
                break;
                case "queue":
                    if(queue.repeatMode === 0){
                        queue.setRepeatMode(QueueRepeatMode.QUEUE);
                        await interaction.reply(`Ta file d'attente va être lu en boucle !`)
                    }   else{
                        queue.setRepeatMode(QueueRepeatMode.OFF);
                        await interaction.reply(`Ta file d'attente ne va plus être lu en boucle !`)
                    }
                    break;
        
            default:
                break;
        }
    }

};
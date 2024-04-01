const { useQueue, QueueRepeatMode } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Pagination = require("../../classes/pagination");

module.exports = {

data: new SlashCommandBuilder()
.setName("file")
.setDescription("Naviguer dans la file d'attente de la musique")
.setDMPermission(false)
.setDefaultMemberPermissions(null),

    async run(interaction) {

        await interaction.deferReply();
        
        const queue = useQueue(interaction.guild.id);
        if(!queue || !queue.isPlaying()) return await interaction.followUp("Le bot ne joue pas de musique.");
        if(!queue.history.nextTrack) return await interaction.followUp("Il n'y a pas de musique jouée avant celle-ci.");
        const tracks = queue.history.tracks.data.filter(t => interaction.client.blindtests.get(interaction.guildId)?.playlist !== t.playlist?.url);
        if(tracks.length < 1 ) return await interaction.followUp("Il n'y a pas de musique jouée avant celle-ci.");
        const embeds = [];
        for(let i = 0; i < tracks.length; i++) {
            const embed = new EmbedBuilder()
            .setColor(interaction.client.color)
            .setTitle(`Musique n°${i+1}`)
            .setTimestamp()
            .setFooter({text: `${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL()});
            embeds.push(embed);
        };

        const pagination = new Pagination(embeds, (embed, index) => embed.setThumbnail(tracks[index].thumbnail).setDescription(`Loop : ${queue.repeatMode === QueueRepeatMode.QUEUE ? "queue" : queue.repeatMode === QueueRepeatMode.TRACK ? "track" : "off"}\`\nMusique : \`${tracks[index].title}\`\nDurée : \`${tracks[index].duration}\`\nAuteur : \`${tracks[index].author}\`\nVues : \`${tracks[index].views}\`\nDemandé par : ${interaction.client.users.cache.get(tracks[index].requestedBy.id)}\nPlaylist : \`${tracks[index].playlist ? "Oui" : "Non"}\`\``))
        await pagination.reply(interaction);
    }

};
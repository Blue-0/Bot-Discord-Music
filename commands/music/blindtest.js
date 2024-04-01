const { useQueue, Playlist } = require("discord-player");
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blindtest")
    .setDescription("Démarrer ou arrêter me BlindTest")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((opt) =>
      opt
        .setName("start")
        .setDescription("Démarrer un blindtest")
        .addStringOption((opt) =>
          opt
            .setName("playlist")
            .setDescription("Blindtest playlist")
            .setRequired(true)
        )
    )
    .addSubcommand((opt) =>
      opt.setName("stop").setDescription("Arrêter le blindtest")
    ),

  async run(interaction) {

    

    const voiceChannelMember = interaction.member.voice.channel;
    const voiceChannelBot = (await interaction.guild.members.fetchMe()).voice
      .channel;
    if (!voiceChannelMember)
      return await interaction.followUp("Tu n'est pas dans un channel.");
    if (voiceChannelBot && voiceChannelBot.id !== voiceChannelMember.id)
      return await interaction.followUp(
        "Tu n'est pas dans le même channel que le Bot."
      );


      
    switch (interaction.options.getSubcommand()) {
      case "start":
        if (interaction.client.blindtests.get(interaction.guildId))
          return await interaction.reply(
            "Il y a un blindtest en cours sur le serveur."
          );

        await interaction.deferReply();
        const request = interaction.options.getString("playlist");

        await interaction.followUp("Récupération de la playlist");

        const search = await interaction.client.player.search(request);
        if (!search._data.queryType.toLowerCase().includes("playlist"))
          return await interaction.editReply("Tu dois indiquer une playlist");

        await interaction.editReply("Mélange de la playlist");
        search._data.playlist.tracks = search._data.playlist.tracks.sort(
          (a, b) => 0.5 - Math.random()
        );

        await interaction.editReply("La playlist ce lance ...");

        const playlist = new Playlist(
          interaction.client.player,
          search._data.playlist
        );
        await playlist.play(voiceChannelMember, {
          requestedBy: interaction.user,
          nodeOptions: {
            metadata: interaction,
            volume: 70,
            leaveOnStop: false,
            LeaveOnEmpty: false,
            leaveOnEnd: false,
            selfDeaf: true,
          },
        });

        interaction.client.blindtests.set(interaction.guildId, {
          playlist: search._data.playlist.url,
          channel: voiceChannelMember.id,
          users: [],
          count: 1,
          author: interaction.user.id,
        });

        await interaction.editReply(
          `${interaction.user} le blindtest commence ici <#${voiceChannelMember.id}>.`
        );
        await voiceChannelMember.send(
          `Le blindtest commencer demarre ! Mettez vos réponse dans ce channel sous cette forme \`Chanteur - Musique\` (exemple: \`Lady gaga - Poker Face\`). Track: \`1/${playlist.tracks.length}\`.`
        );

        const filter = (m) => m.author.id !== interaction.user.id;
        const collector = voiceChannelMember.createMessageCollector({});

        collector.on("collect", async (message) => {
          const queue = useQueue(interaction.guildId);
          const singer = queue.history.currentTrack.author
            .toLowerCase()
            .split(", ");
          const part = message.content.toLowerCase().split(" - ");

          if (
            queue.history.currentTrack.title
              .toLocaleLowerCase()
              .replace(/\(feat\.[^)]+\)/g, "") === part[1] &&
            singer.every((a) =>
              part[0]
                .split(/[,&]/g)
                .map((s) => s.trim())
                .includes(a)
            )
          ) {
            const blindtest = interaction.client.blindtests.get(
              interaction.guildId
            );

            if (blindtest.users.find((u) => u.id === message.author.id))
              blindtest.users.find((u) => u.id === message.author.id).points++;
            else blindtest.users.push({ id: message.author.id, points: 1 });
            await message.reply(
              `${
                message.author
              } à trouver la musique, il gagne 1 point, il a \`${
                blindtest.users.find((u) => u.id === message.author.id).points
              }\` point${
                blindtest.users.find((u) => u.id === message.author.id).points >
                1
                  ? "s"
                  : ""
              }`
            );
            blindtest.count++;
            if (blindtest.count > playlist.tracks.length) colletor.stop();
            else {
              await voiceChannelMember.send(
                `Musique \`${blindtest.count}/${
                  playlist.tracks.length
                }\`. Mettez vos réponse dans ce channel sous cette forme \`Chanteur - Musique\` (exemple: \`Lady gaga - Poker Face\`). \n${blindtest.users
                  .sort((a, b) => b.points - a.points)
                  .slice(0, 10)
                  .map(
                    (u, index) =>
                      `\` ${index + 1}\`. ${interaction.client.users.cache.get(
                        u.id
                      )} => \`${u.points}\`${u.points > 1 ? "s" : ""}`
                  )
                  .join("\n")}.`
              );
              queue.node.skip();
            }
          }
        });
        collector.on("stop", async () => {
          const queue = useQueue(interaction.guildId);
          await voiceChannelMember.send(
            `${interaction.client.users.cache.get(
              interaction.client.blindtests
                .get(interaction.guildId)
                .users.sort((a, b) => b.points - a.points)[0].id
            )} gagne le blindtest ! Voici le tableau des scores: \n${interaction.client.blindtests
              .get(interaction.guildId)
              .users.sort((a, b) => b.points - a.points)
              .slice(0, 10)
              .map(
                (u, index) =>
                  `\` ${index + 1}\`. ${interaction.client.users.cache.get(
                    u.id
                  )} => \`${u.points}\`${u.points > 1 ? "s" : ""}`
              )
              .join("\n")}.`
          );
          interaction.client.blindtests.delete(interaction.guildId);
          queue.node.stop();
          queue.delete();
        });
        break;
      case "stop":
        const queue = useQueue(interaction.guildId);

        const blindtest = interaction.client.blindtests.get(
          interaction.guildId
        );
        if (interaction.user.id !== blindtest.author)
          return await interaction.reply(
            "Il n'y a pas de blindtest en cours sur le serveur."
          );
        if (!blindtest)
          return await interaction.reply(
            "Tu n'es pas le créateur du blindtest."
          );
        if (blindtest.users.length < 1)
          await interaction.reply(
            `${interaction.user} a stoppé le blindtest dans le channel <#${voiceChannelMember.id}>.`
          );
        else
          await interaction.reply(
            `${interaction.user} a stoppé le blindtest dans le channel <#${
              voiceChannelMember.id
            }>. \n${interaction.client.users.cache.get(
              blindtest.users.sort((a, b) => b.points - a.points)[0].id
            )} gagne le blindtest ! Voici le tableau des scores: \n${interaction.client.blindtests
              .get(interaction.guildId)
              .users.sort((a, b) => b.points - a.points)
              .slice(0, 10)
              .map(
                (u, index) =>
                  `\` ${index + 1}\`. ${interaction.client.users.cache.get(
                    u.id
                  )} => \`${u.points}\`${u.points > 1 ? "s" : ""}`
              )
              .join("\n")}. `
          );

        interaction.client.blindtests.delete(interaction.guildId);
        queue.node.stop();
        queue.delete();

        break;
    }
  },
};

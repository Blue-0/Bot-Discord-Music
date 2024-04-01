module.exports = {
    
    name: "playerStart",
    async run(client, queue, track) {

            if(client.blindtests.get(queue.metadata.channel.guildId)?.playlist === track.playlist?.url) return;

            await queue.metadata.channel.send(`La musique \`${track.title}\` dure \`${track.duration}\` demandée par \`${track.requestedBy.username}\` est jouée.`);
        } 
    };


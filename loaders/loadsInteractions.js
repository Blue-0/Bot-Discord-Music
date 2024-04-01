const { readdirSync } = require("fs");

module.exports = client => {

    let count = 0;
    const dirsInteractions = readdirSync("./interactions/");

    for(const dirs of dirsInteractions) {
        const filesDirs = readdirSync(`./interactions/${dirs}/`).filter(ƒ => ƒ.endsWith(".js"));
        for(const files of filesDirs) {
            const interaction = require(`../interactions/${dirs}/${files}`);
            client.interactions.set(interaction.name, interaction);
            count++; 
        }
    };
    console.log(`[interactions] => ${count} loaded interactions`)
};
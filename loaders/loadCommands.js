const { readdirSync } = require("fs");

module.exports =  clients => {

    let count= 0;
    const dirsCommands = readdirSync("./commands/");

    for(const dirs of dirsCommands) {
        const filesDirs = readdirSync(`./commands/${dirs}/`).filter(ƒ => ƒ.endsWith(".js"));
        for(const files of filesDirs){
            const command = require(`../commands/${dirs}/${files}`);
            clients.commands.set(command.data.name, command);
            count++;
        };
    };

    console.log(`[Commands] => ${count} logged command`)

}
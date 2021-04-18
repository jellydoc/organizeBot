const Discord = require("discord.js");
const bot = new Discord.Client();

const token = process.env.DISCORD_BOT_SECRET;

const commandCooldown = new Set();

const color = "#6d9eeb";
const displayPrefix = "-"

bot.on("ready", () => {
  console.log("This bot is online");
  bot.user.setActivity(`${displayPrefix}help | ${(bot.guilds.cache.size).toLocaleString()} servers`, { type: "PLAYING" });
});

bot.on("guildCreate", guild => {
	bot.user.setActivity(`${displayPrefix}help | ${(bot.guilds.cache.size).toLocaleString()} servers`, { type: "PLAYING" });
});

bot.on("guildDelete", guild => {
	bot.user.setActivity(`${displayPrefix}help | ${(bot.guilds.cache.size).toLocaleString()} servers`, { type: "PLAYING" });
});

bot.on("message", message => {
  if (message.author.bot) return;
	if (message.channel instanceof Discord.DMChannel) return;

	var PREFIX = displayPrefix

  let args = message.content.substring(PREFIX.length).split(" ");

  if (message.content.toLowerCase().indexOf([PREFIX]) !== 0) return;

  switch (args[0].toLowerCase()) {
		case "help":
			var embed = new Discord.MessageEmbed()
				.setTitle(`Commands`)
				.addField(`Channels`, `sort`)
				.addField(`Use ${PREFIX} before every command`, `[Invite](https://discord.com/oauth2/authorize?client_id=807284116323696711&scope=bot&permissions=8)`)
				.setColor(color)
			message.channel.send(embed);
    break;

		case "sort":
			if(commandCooldown.has(message.guild.id)){
			var embed = new Discord.MessageEmbed()
				.setTitle(`Command is on cooldown until the current process finishes`)
				.setColor(color);
			message.channel.send(embed);
			} else {
				if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_CHANNELS")) return message.channel.send("I need the `MANAGE_CHANNELS` permission to use this command")
				if (!message.member.hasPermission("MANAGE_CHANNELS", (explicit = true))) return message.channel.send("You need to have the `MANAGE_CHANNELS` permission to use this command");
				if (!args[1]) return message.channel.send("You need to say the name of the category you you like to organize")
				var guild = message.guild;
				var category = guild.channels.cache.find(c => c.name.toLowerCase() == (args.slice(1).join(" ")).toLowerCase() && c.type == "category");
				if (!category) return message.channel.send("Category channel does not exist");

				var alphaDesc = (b, a) => {
					if (a.name > b.name) {
						return -1;
					}
					if (b.name > a.name) {
						return 1;
					}
					return 0;
				};

				var textChannels = new Discord.Collection();

				textChannels.set('__none', category.children.filter(channel => channel.type == 'text').sort(alphaDesc));

				var list = [];
				var IDarray = [];
				for (let [categoryID, children] of textChannels) {
					if (category) list.push(`**${category.name}**`);
					for (let [, child] of children) {
						list.push(child.type === 'text' ? child : child.name);
						IDarray.push(child.id);
					}
				}

				message.channel.send(`Organizing channels... estimated time remaining: ${IDarray.length} seconds`).then((sentMessage) => {
					commandCooldown.add(message.guild.id);
					for (i = 0; i < IDarray.length; i++) {
						task(i);
					}

					function task(i) { 
						setTimeout(function() {
							var channel = message.guild.channels.cache.get(IDarray[i]);
							channel.setPosition(i)
							if (i == (IDarray.length - 1)) {
								var embed = new Discord.MessageEmbed()
									.setTitle(`A-Z Organization has been applied`)
									.setDescription(`${list.join('\n')}`)
									.setFooter(`Note: Some channels may still be moving around`)
									.setColor(color)
								sentMessage.edit(embed);
								commandCooldown.delete(message.guild.id);
							}
						}, 1000 * i); 
					}
				})
			}		
		break;
  }
});

bot.login(token);

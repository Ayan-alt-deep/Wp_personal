const { izumi,mode } = require('../lib/');
const fs = require('fs');
const got = require("got");
const Db = require('../lib/database/plugin');
const Config = require("../config");
const simpleGit = require("simple-git");
const git = simpleGit();
const exec = require("child_process").exec;

izumi(
  {
    pattern: "setvar ?(.*)",
    fromMe: true,
    desc: "Set environment variable",
    type: "config",
  },
  async (message, text) => {
    if (!text.match(/^[^=:]+[=:]/)) {
      return await message.send('*Invalid format.*\n_Use: KEY:VALUE or KEY=VALUE_');
    }

    let parts = text.split(/[=:]/);
    let key = parts[0].trim();
    let value = parts.slice(1).join('').trim();

    if (!value) {
      return await message.send('Please specify a value');
    }

    let data = await fs.readFileSync('config.env', 'utf8');
    let lines = data.split('\n');
    let obj = {};

    lines.forEach(line => {
      let parts = line.split(/[=:]/);
      let k = parts[0].trim();
      let v = parts.slice(1).join('').trim();
      obj[k] = v;
    });

    obj[key] = value;
    let updatedData = Object.entries(obj).map(([k, v]) => `${k}=${v}`).join('\n');

    await fs.writeFileSync('config.env', updatedData, 'utf8');
    await require('dotenv').config({ path: './config.env', override: true });

    await message.send(`_Updated *${key}* with value *${value}*_`);
    await message.reply("_Bot restarting, wait for 30 seconds_");
    return require('pm2').restart('index.js');
  }
);

izumi(
  {
    pattern: "delvar ?(.*)",
    fromMe: true,
    desc: "Delete environment variable",
    type: "config",
  },
  async (message, match) => {
    if (!match) return await message.reply(`_Example: delvar sudo_`);

    let data = await fs.readFileSync('config.env', 'utf8');
    let lines = data.split('\n');
    let key = match.trim().toUpperCase();
    let newLines = lines.filter(line => !line.startsWith(key + '=') && !line.startsWith(key + ':'));

    if (newLines.length === lines.length) {
      return await message.send(`_Key *${key}* not found_`);
    }

    await fs.writeFileSync('config.env', newLines.join('\n'), 'utf8');
    await require('dotenv').config({ path: './config.env', override: true });

    await message.send(`_Deleted *${key}*_`);
    await message.reply("_Bot restarting, wait for 30 seconds_");
    return require('pm2').restart('index.js');
  }
);

izumi(
  {
    pattern: "getvar ?(.*)",
    fromMe: true,
    desc: "Show environment variable",
    type: "config",
  },
  async (message, match) => {
    if (!match) {
      return await message.send('*Please specify a key*');
    }

    let data = await fs.readFileSync('config.env', 'utf8');
    let lines = data.split('\n');
    let obj = {};

    lines.forEach(line => {
      let parts = line.split(/[=:]/);
      let k = parts[0].trim();
      let v = parts.slice(1).join('').trim();
      obj[k] = v;
    });

    match = match.toUpperCase();
    let value = obj[match];

    if (!value) {
      return await message.send(`_Key *${match}* not found_`);
    }

    return await message.send(`_${match}: ${value}_`);
  }
);

izumi(
  {
    pattern: "allvar$",
    fromMe: true,
    desc: "Show all environment variables",
    type: "config",
  },
  async (message) => {
    let data = await fs.readFileSync('config.env', 'utf8');
    let lines = data.split('\n');
    let obj = {};

    lines.forEach(line => {
      let parts = line.split(/[=:]/);
      let k = parts[0].trim();
      let v = parts.slice(1).join('').trim();
      obj[k] = v;
    });

    let str = Object.entries(obj).map(([k, v]) => `${k} = ${v}`).join('\n');
    return await message.send(`*All config vars:*\n${str}`);
  }
);

izumi(
  {
    pattern: "update$",
    fromMe: true,
    dontAddCommandList: true, 
    desc: "Checks for updates.",
  },
  async (message) => {
    await git.fetch();
    var commits = await git.log([Config.BRANCH + "..origin/" + Config.BRANCH]);

    if (commits.total === 0) {
      await message.reply("Already on the latest version.");
      return;
    }

    var updates = "Update Available\n\nChanges:\n";
    updates += "--------------------------------------\n";
    updates += commits.all
      .map(commit => `[${commit.date.substring(0, 10)}] ${commit.message} - ${commit.author_name}`)
      .join("\n");
    updates += "\n--------------------------------------";

    await message.reply(updates);
  }
);

izumi(
  {
    pattern: "update now$",
    fromMe: true,
    dontAddCommandList: true,
    desc: "Updates Izumi",
  },
  async (message) => {
    await git.fetch();
    var commits = await git.log([Config.BRANCH + "..origin/" + Config.BRANCH]);
    if (commits.total === 0) {
      return await message.reply("_Already on the latest version_");
    } else {
      await message.reply("_Updating_");

      git.pull(async (err, update) => {
        if (update && update.summary.changes) {
          await message.reply("*_UPDATED_*");
          await message.reply("_Bot restarting, wait for some time_");
          exec("npm install").stderr.pipe(process.stderr);
          return require('pm2').restart('index.js');
        } else if (err) {
          await message.reply(
            "*❌ Update failed!*\n*Error:* ```" + err + "```"
          );
        }
      });
    }
  }
);
izumi({
	pattern: 'reboot$',
	fromMe: true,
	desc: 'Bot restart',
	type: 'user'
}, async (message, match, client) => {
await message.send("_rebooting_");
return require('pm2').restart('index.js');
});

const value = [
    "99000", "88000", "77000", "660000", "55000", 
    "44000", "33000", "22000", "11000", "9999", "999", "99"
];

izumi({
    pattern: "repo$",
    fromMe: mode,
    desc: "Izumi",
    type: "info",
}, async (message, match, client) => {
    // Generate a random amount
    const amount = value[Math.floor(Math.random() * value.length)];
    const amountInPaise = parseInt(amount, 10) * 1000;

    // Message caption with separators
    const caption = 
        "--------------------------------------\n" +
        "Izumi-md\n\n" +
        "Repo: https://github.com/Akshay-Eypz/izumi-bot\n\n" +
        "WhatsApp Channel: https://whatsapp.com/channel/0029Vaf2tKvGZNCmuSg8ma2O\n\n" +
        "Telegram Group: https://t.me/izumi_support\n" +
        "--------------------------------------";

   
    await message.client.relayMessage(message.jid, {
        requestPaymentMessage: {
            currencyCodeIso4217: 'INR',
            amount1000: amountInPaise,
            requestFrom: message.sender,
            noteMessage: {
                extendedTextMessage: {
                    text: caption,
                    contextInfo: {
                        externalAdReply: { showAdAttribution: true }
                    }
                }
            }
        }
    }, { quoted: message.quoted });
});

izumi({
  pattern: 'plugin ?(.*)',
  fromMe: true,
  desc: 'new plugin installer',
  type: 'user'
}, async (message, match) => {
  let text = match || (message.quoted ? message.quoted.text : '');
  if (match == "list") {
    let mesaj = "";
    let plugins = await Db.PluginDB.findAll();
    if (plugins.length < 1) {
      return await message.reply("_No external plugins installed_");
    } else {
      plugins.map((plugin) => {
        mesaj +=
          "```" +
          plugin.dataValues.name +
          "```: " +
          plugin.dataValues.url +
          "\n";
      });
      return await message.reply(mesaj);
    }
  } else {
    if (!text) return await message.reply("_Send a plugin url_");
    try {
      var url = new URL(text);
    } catch (e) {
      console.log(e);
      return await message.reply("_Invalid Url_");
    }

    if (url.host === "gist.github.com") {
      url.host = "gist.githubusercontent.com";
      url = url.toString() + "/raw";
    } else {
      url = url.toString();
    }

    var plugin_name;
    var { body, statusCode } = await got(url);
    if (statusCode == 200) {
      var comand = body.match(/(?<=pattern:) ["'](.*?)["']/);
      if (comand) {
        plugin_name = comand[0].replace(/["']/g, "").trim().split(" ")[0];
      }
      if (!plugin_name) {
        plugin_name = "__" + Math.random().toString(36).substring(8);
      }
      fs.writeFileSync(__dirname + "/" + plugin_name + ".js", body);
      try {
        require("./" + plugin_name);
      } catch (e) {
        fs.unlinkSync(__dirname + "/" + plugin_name + ".js");
        return await message.reply("Invalid Plugin\n ```" + e + "```");
      }

      await Db.installPlugin(url, plugin_name);

      await message.reply(`_New plugin installed : ${plugin_name}_`);
    }
  }
});
izumi({
	pattern: "remove(?: |$)(.*)",
	fromMe: true,
	desc: 'remove plugin',
	type: 'user'
}, async (message, match) => {
	    if (!match) return await message.reply("_Need a plugin name_");

    var plugin = await Db.PluginDB.findAll({ where: { name: match } });

    if (plugin.length < 1) {
      return await message.reply("_Plugin not found_");
    } else {
      await plugin[0].destroy();
      delete require.cache[require.resolve("./" + match + ".js")];
      fs.unlinkSync(__dirname + "/" + match + ".js");
      await message.reply(`Plugin ${match} deleted`);
    }
  }
);

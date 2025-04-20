const { izumi } = require("../lib"); const Jimp = require("jimp"); const { S_WHATSAPP_NET } = require("@adiwajshing/baileys");

izumi( { pattern: "fullpp", fromMe: true, desc: "Set full profile picture", type: "user", }, async (message) => { if (!message.quoted || !message.quoted.image) return await message.reply("Reply to an image to set as profile picture");

try {
  let imgBuffer = await message.quoted.download();
  let jimp = await Jimp.read(imgBuffer);
  let min = jimp.getWidth();
  let max = jimp.getHeight();
  let cropped = jimp.crop(0, 0, min, max);
  let img = await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG);
  
  await message.client.query({
    tag: "iq",
    attrs: {
      to: S_WHATSAPP_NET,
      type: "set",
      xmlns: "w:profile:picture",
    },
    content: [
      {
        tag: "picture",
        attrs: { type: "image" },
        content: img,
      },
    ],
  });
  
  await message.reply("Profile picture updated successfully!");
} catch (error) {
  await message.reply("Failed to set profile picture. Error: " + error.message);
}

} );

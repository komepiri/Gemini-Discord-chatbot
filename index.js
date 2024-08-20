const { Client, GatewayIntentBits } = require('discord.js');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const TOKEN = process.env['DISCORD-BOT-TOKEN']

client.once('ready', async () => {
    console.log('Bot is ready!');
        const data = [{
        name: "gpt",
        description: "ChatGPTじゃないけどgptです",
        options: [{
            type: 3,
            name: "text",
            description: "AIに送る文",
            required: true
        }],
    }];
    await client.application.commands.set(data);
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// 生成
async function generate(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const result = await chat.sendMessage(text);
  const response = result.response;
  return response.text(); // 直接text()を返すように修正
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!gpt ')) {
        const userMessage = message.content.slice(5);

         try {
            const text = await generate(userMessage);

            // メッセージが送信されたチャンネルに、Geminiの返信を送信
            await message.channel.send(text);
        } catch (err) {
            console.log(err);
        }
    }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'gpt') {
    const userMessage = interaction.options.getString('text'); // スラッシュコマンドのオプションを取得

    try {
      const text = await generate(userMessage);

      // コマンドに対する応答を送信
      await interaction.reply(text);
    } catch (err) {
      console.log(err);
      await interaction.reply('エラーが発生しました。');
    }
  }
});

client.login(TOKEN);
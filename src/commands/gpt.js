//Give credits to TechnologyPower#3174
const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("neebyaiv3")
    .setDescription("Задайте GPT 3.0 несколько вопросов")
    .addStringOption((options) =>
      options.setName("query").setDescription("Give a query").setRequired(true)
    ),
  /**
   *
   * @param { ChatInputCommandInteraction } interaction
   * @param { Client } client
   */
  async execute(interaction, client) {
    const { user, options } = interaction;
    const query =
      (await options.getString("query")) || "Как твои дела? - Не предусмотрено";
 
    await interaction.deferReply();
    const { Configuration, OpenAIApi } = require("openai");
    org = ""
    key = ""
    const configuration = new Configuration({
      organization: org,
      apiKey: key,
    });
    const openai = new OpenAIApi(configuration);

    const gptResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Эй, дай мне ответ на это: ${query}`,
      temperature: 0.5,
      max_tokens: 2000,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
    });
    if (gptResponse === undefined || gptResponse === null) {
      interaction.editReply({
        content: "Я не понял!, вы можете запустить команду еще раз?",
        ephemeral: true,
      });
      return;
    } else {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${user.tag}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`Действие: \`${query}\``)
        .setDescription(
          "**Ответ:\n** ```" + gptResponse.data.choices[0].text + "```"
        )
        .setColor("Random");
      interaction.editReply({ embeds: [embed], ephemeral: true });
    }
  },
};

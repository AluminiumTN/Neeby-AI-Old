const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
module.exports = {
  Cooldown: true,
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Отправьте чтобы создать обсуждение")
    .addStringOption((options) =>
      options
        .setName("message")
        .setDescription("Обсуждение ввиде текста")
        .setMinLength(1)
        .setMaxLength(512)
        .setRequired(true)
    )
    .addStringOption(
      (options) =>
        options
          .setName("type")
          .setDescription("Дизайн обсжудения")
          .addChoices(
            
           
            { name: "Text", value: "t" },
           
          ).setRequired(true)
    ),
  /**
   *
   * @param { ChatInputCommandInteraction } interaction
   */
  async execute(interaction) {
    const { options, user } = interaction;
    let message = options.getString("message");
    let type = options.getString("type");
    switch (type) {
      case "t":
        interaction.reply({ content: `${message}` });
        break;
      case "e":
        const Embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle("")
          .setDescription(`${message}`)
          .setFooter({ text: `Создано ${user.tag} ` })
          .setTimestamp();
        interaction.reply({ embeds: [Embed] });
        break;
      case "te":
        interaction.reply({ content: `${message}`, ephemeral: true });
        break;
      case "ee":
        const Embed1 = new EmbedBuilder()
          .setColor("Random")
          .setTitle("")
          .setDescription(`${message}`)
          .setTimestamp();
        interaction.reply({ embeds: [Embed1], ephemeral: true });
        break;
    }
  },
};

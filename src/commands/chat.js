// import the required classes
const { SlashCommandBuilder } = require('discord.js');
const { ChatManager } = require('../utils/model-managers.js');
const { DatabaseManager } = require('../utils/database-manager.js');

// create instance of ChatAI class and DatabaseManager class
const chat = new ChatManager();
let db;
(async () => {
    db = await new DatabaseManager().init();
})();

// export an object with the data and execute properties
module.exports = {
    // data object for the command
    data: new SlashCommandBuilder()
	    .setName('chat') // name of the command
	    .setDescription('Управляйте чатом с помощью OpenAI GPT') // description of the command
	    .addSubcommand(subcommand => // subcommand for opening a chat session
		    subcommand
			    .setName('open') // name of the subcommand
			    .setDescription('Открыть/продолжить сеанс чата') // description of the subcommand
	    )
	    .addSubcommand(subcommand => // subcommand for closing a chat session
		    subcommand
			    .setName('close') // name of the subcommand
			    .setDescription('Закройте сеанс чата (разговор будет сохранен)') // description of the subcommand
	    )
	    .addSubcommand(subcommand => // subcommand for deleting a chat session
		    // set the name and description of the subcommand
		    subcommand
			    .setName('delete') // name of the subcommand
			    .setDescription('Удалить беседу НАВСЕГДА') // description of the subcommand
			    .addStringOption(option => // string option for confirmation
				    option.setName('confirm') // name of the option
					    .setDescription('Это действие НЕОБРАТИМО. Ты уверен?') // description of the option
					    .setRequired(true) // option required
					    .addChoices( // choices for the option
						    { name: 'No', value: 'no' },
						    { name: 'Yes', value: 'yes' }
					    )),
	    ),

    // execute function for the command
    async execute(interaction) {
        // get subcommand from interaction object
        const input = interaction.options.getSubcommand();
        // get user id from interaction object
        const user_id = interaction.user.id;
        // insert user in database if not already in
        if (! await db.is_user_inserted(user_id)) {
            await db.insert_new_user(user_id);
            await db.init_user_chat(user_id, chat.defaultPrompt);
        }
        // input is 'open'
        if (input === 'open') {
            // if user chat status is false
            if (! await db.get_user_chat_status(user_id)) {
                // set user chat status to true
                await db.set_user_chat_status(user_id, true);
                // send log to the user
                await interaction.reply('`Сеанс чата открыт!\nОтправьте сообщение, и OpenAI ответит.`');
            } else {
                // user chat status is already true
                await interaction.reply('`Сеанс чата уже открыт!`'); 
            }
        // input is 'close'
        } else if (input === 'close') {
            // if user chat status is true
            if (await db.get_user_chat_status(user_id)) {
                // set user chat status to false
                await db.set_user_chat_status(user_id, false);
                // send log to the user
                await interaction.reply('`Сеанс чата закрыт!`');
            } else {
                // user chat status is already false
                await interaction.reply('`Сеанс чата уже закрыт!`');
            }
        // input is 'delete'
        } else if (input === 'delete') {
            // get confirmation from the user
            const confirmation = interaction.options.getString('confirm');
            // if positive
            if (confirmation === 'yes') {
                // permanently delete chat history of the user from database
                await db.init_user_chat(user_id, chat.defaultPrompt);
                // send log to the user
                await interaction.reply('`Чат УДАЛЕН!`');
                console.log(`Чат УДАЛЕН из базы данных для пользователя ${user_id}.`);
            // if negative
            } else {
                // send action canceled log to the user
                await interaction.reply('`Действие отменено.`');
            }
        }
    },

    // reply function for the command
    async reply(interaction) {
        // get user id from interaction object
        const user_id = interaction.author.id;
        // if user not in database return
        if (! await db.is_user_inserted(user_id)) {
            return;
        }
        // if user chat status is false return
        if (! await db.get_user_chat_status(user_id)) {
            return;
        }
        // get user chat from database
        const chat_text = await db.get_user_chat(user_id);
        // generate a reply from the user message
        const response = await chat.generate_reply(chat_text, interaction.content);
        // update user chat in database
        await db.update_user_chat(user_id, response['message']+response['reply']+'\n')
        // send reply to user containing generated reply
        await interaction.reply(response['reply']);
        console.log('Ответ отправлен!');
    },
};


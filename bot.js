const Discord = require('discord.js');

const Util = require('discord.js');

const getYoutubeID = require('get-youtube-id');

const fetchVideoInfo = require('youtube-info');

const YouTube = require('simple-youtube-api');

const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");

const queue = new Map();

const ytdl = require('ytdl-core');

const fs = require('fs');

const gif = require("gif-search");

const client = new Discord.Client({disableEveryone: true});

const prefix = "r";
/////////////////////////
////////////////////////

client.on('message', async msg =>{
	if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;
    
    let args = msg.content.split(' ');

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

    if(command === `ping`) {
    let embed = new Discord.RichEmbed()
    .setColor(3447003)
    .setTitle("Pong!")
    .setDescription(`${client.ping} ms,`)
    .setFooter(`Requested by | ${msg.author.tag}`);
    msg.delete().catch(O_o=>{})
    msg.channel.send(embed);
    }
});
/////////////////////////
////////////////////////
//////////////////////
client.on('message', async msg =>{
	if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;
    
    let args = msg.content.split(' ');

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

    if(command === `avatar`){
	if(msg.channel.type === 'dm') return msg.channel.send("Nope Nope!! u can't use avatar command in DMs (:")
        let mentions = msg.mentions.members.first()
        if(!mentions) {
          let sicon = msg.author.avatarURL
          let embed = new Discord.RichEmbed()
          .setImage(msg.author.avatarURL)
          .setColor("#5074b3")
          msg.channel.send({embed})
        } else {
          let sicon = mentions.user.avatarURL
          let embed = new Discord.RichEmbed()
          .setColor("#5074b3")
          .setImage(sicon)
          msg.channel.send({embed})
        }
    };
});
/////////////////////////
////////////////////////
//////////////////////
/////////////////////////
////////////////////////
//////////////////////

/////////////////////////
////////////////////////
//////////////////////
/////////////////////////
////////////////////////
//////////////////////
client.on('message', async msg => { 
	if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;
    
    const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
    
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

	if (command === `play`) {
		const voiceChannel = msg.member.voiceChannel;
        
        if (!voiceChannel) return msg.channel.send("**__I can't find you in any voice channel!__**.");
        
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        
        if (!permissions.has('CONNECT')) {

			return msg.channel.send("**__I don't have enough permissions to join your voice channel!__**.");
        }
        
		if (!permissions.has('SPEAK')) {

			return msg.channel.send("**__I don't have enough permissions to speak in your voice channel!__**.");
		}

		if (!permissions.has('EMBED_LINKS')) {

			return msg.channel.sendMessage("**__I don't have enough permissions to insert a URLs!__**.")
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {

			const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            

			for (const video of Object.values(videos)) {
                
                const video2 = await youtube.getVideoByID(video.id); 
                await handleVideo(video2, msg, voiceChannel, true); 
            }
			return msg.channel.send(`**${playlist.title}**, **__Just added to the list!__**.`);
		} else {

			try {

                var video = await youtube.getVideo(url);
                
			} catch (error) {
				try {

					var videos = await youtube.searchVideos(searchString, 5);
					let index = 0;
                    const embed1 = new Discord.RichEmbed()
                    .setTitle(":mag_right:  **__YouTube Search Results__**. :")
                    .setDescription(`
                    ${videos.map(video2 => `${++index}. **${video2.title}**`).join('\n')}`)
                    
					.setColor("#f7abab")
					msg.channel.sendEmbed(embed1).then(message =>{message.delete(20000)})
					
/////////////////					
					try {

						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 15000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('**__No one respone a number!__**.');
                    }
                    
					const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                    
				} catch (err) {

					console.error(err);
					return msg.channel.send("**__I didn't find any results!__**.");
				}
			}

            return handleVideo(video, msg, voiceChannel);
            
        }
        
	} else if (command === `skip`) {

		if (!msg.member.voiceChannel) return msg.channel.send("**__You Must be in a Voice channel to Run the Music commands!__**.");
        if (!serverQueue) return msg.channel.send("**__There is no list to skip!__**.");

		serverQueue.connection.dispatcher.end('**__Yeah Skipped__**.');
        return undefined;
        
	} else if (command === `stop`) {

		if (!msg.member.voiceChannel) return msg.channel.send("**__You Must be in a Voice channel to Run the Music commands!__**.");
        if (!serverQueue) return msg.channel.send("**__There is no list to stop!__**.");
        
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('**__Ok, stopped & disconnected from your Voice channel__**.');
        return undefined;
        
	} else if (command === `vol`) {

		if (!msg.member.voiceChannel) return msg.channel.send("**__You Must be in a Voice channel to Run the Music commands!__**.");
		if (!serverQueue) return msg.channel.send('**__You only can use this command while music is playing!__**.');
        if (!args[1]) return msg.channel.send(`**__The bot volume is__** **${serverQueue.volume}**`);
        
		serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 50);
        
        return msg.channel.send(`**__Volume Now is__** **${args[1]}**`);

	} else if (command === `np`) {

		if (!serverQueue) return msg.channel.send('**__There is no list!__**.');
		const embedNP = new Discord.RichEmbed()
	    .setDescription(`**__Now playing__** **${serverQueue.songs[0].title}**`)
        return msg.channel.sendEmbed(embedNP);
        
	} else if (command === `list`) {
		
		if (!serverQueue) return msg.channel.send('**__There is no list!__**.');
		let index = 0;
//	//	//
		const embedqu = new Discord.RichEmbed()
        .setTitle("**__The list Songs :__**.")
        .setDescription(`
        ${serverQueue.songs.map(song => `${++index}. **${song.title}**`).join('\n')}
**Now playing :** **${serverQueue.songs[0].title}**`)
        .setColor("#f7abab")
		return msg.channel.sendEmbed(embedqu);
	} else if (command === `pause`) {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('**__Ok, paused__**.');
		}
		return msg.channel.send('**__There is no Queue to Pause!__**.');
	} else if (command === "resume") {

		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
            return msg.channel.send('**__Ok, resumed!__**.');
            
		}
		return msg.channel.send('**__list is empty!__**.');
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	

	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`**__I could not join the voice channel__**: ${error}!`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`**__Can't join this channel__**: ${error}!`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`**${song.title}**, **__just added to the list!__**. `);
	} 
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`**${song.title}**, is now playing!`);
}


client.on('message', message => {
    if (message.content === 'help') {
        let helpEmbed = new Discord.RichEmbed()
        .setTitle('**__أوامر بوت الميوزك__**.')
        .setDescription('**__برفكس البوت (1)__**')
        .addField('**__play__**', '**__لتشغيل اغنية__**')
        .addField('**__join__**', '**__دخول رومك الصوتي__**')
        .addField('**__disconnect__**', '**__الخروج من رومك الصوتي__**')
        .addField('**__skip__**', '**__تخطي الأغنية__**')
        .addField('**__pause__**', '**__ايقاف الاغنية مؤقتا__**')
        .addField('**__resume__**', '**__تكملة الاغنية__**')
        .addField('**__list__**', '**__اظهار قائمة التشغيل__**')
        .addField('**__np__**', '**__اظهار الاغنية اللي انت مشغلها حاليا__**')
        .setFooter('**__(general_command) لاظهار الاوامر العامة__**')
      message.channel.send(helpEmbed);
    }
});

client.on('message', message => {
    if (message.content === 'general_commands') {
        let helpEmbed = new Discord.RichEmbed()
        .setTitle('**__أوامر عامة__**')
        .addField('**__avatar__**', "**__افتار الشخص المطلوب__**")
        .addField('**__gif__**', '**__البحث عن جيف انت تطلبه__**')
        .addField('**__ping__**', '**__معرفة ping البوت__**')
      message.channel.send(helpEmbed);
    }
});

client.login(process.env.BOT_TOKEN);

const axios = require('axios');

const emoteList = async (username, service, page) => {
	if(service == 'all'){

	}else if(service == 'channel' || service == 'twitch'){
		return getChannelEmote(username, page)
	}else if(service == 'bttv' || service == 'betterttv'){
		return getBTTVEmote(username, page)
	}else if(service == 'ffz' || service == 'frankerfacez'){
		return getFFZEmote(username, page)
	}else if(service == '7tv'){
		return get7TVEmote(username, page)
	}
}

const getIntroText = async (page, pages) => {
	return "Emote list ("+page+"/"+pages.length+"): "
}

const splitByCharNbr = async (str, length) => {
	let list = wordWrap(str, length)
	return list
}

const wordWrap = async (str, charMax) => {
	let arr = [];
	let space = /\s/;

	const words = str.split(space);
	// push first word into new array
	if (words[0].length) {
		arr.push(words[0]);
	}

	for (let i = 1; i < words.length; i++) {
		if (words[i].length + arr[arr.length - 1].length < charMax) {
			arr[arr.length - 1] = `${arr[arr.length - 1]} ${words[i
			]}`;
		} else {
			arr.push(words[i]);
		}
	}

	return arr;
}

const twitchUsernameToTwitchID = async (username) => {
	const res = await axios.get(`https://decapi.me/twitch/id/${username}`, {
		headers: { 'User-Agent': 'tm-stream-utils/0.1.0 +https://github.com/danilotitato/TM-stream-utils' },
	})
	.catch(err => {
		console.log(err.message)
		return 'Error while trying to convert username to ID.'
	})

	if(res.data.toString().includes('User not found')){
		return 'User not found.'
	}else{
		return res.data.toString()
	}
}

const getChannelEmote = async (username, page) => {
	const res = await axios.get(`https://decapi.me/twitch/subscriber_emotes/${username}`, {
		headers: { 'User-Agent': 'tm-stream-utils/0.1.0 +https://github.com/danilotitato/TM-stream-utils' },
	})
	.catch(err => {
		console.log(err.message)
		return 'Error while trying to retrieve channel emotes.'
	})

	if(res.data.toString().includes('User not found')){
		return 'User not found.'
	}else{
		let emotes = res.data.emotes.join(' ')
		var pages = await splitByCharNbr(emotes, 380)
		if(page > pages.length){
			page = pages.length
		}
		let intro = await getIntroText(page, pages)
		return intro+pages[page-1]
	}
}

const get7TVEmote = async (username, page) => {
	let data = '{"query":"query GetUser($id: String!) {user(id: $id) {...FullUser,, banned, youtube_id}}fragment FullUser on User {id,email, display_name, login,description,role {id,name,position,color,allowed,denied},emote_aliases,emotes { id, name, status, visibility, width, height },owned_emotes { id, name, status, visibility, width, height },emote_ids,editor_ids,editors {id, display_name, login,role { id, name, position, color, allowed, denied },profile_image_url,emote_ids},editor_in {id, display_name, login,role { id, name, position, color, allowed, denied },profile_image_url,emote_ids},follower_count,broadcast {type,title,game_name,viewer_count,},twitch_id,broadcaster_type,profile_image_url,created_at,emote_slots,audit_entries {id,type,timestamp,action_user_id,action_user {id, display_name, login,role { id, name, position, color, allowed, denied },profile_image_url,emote_ids},changes {key, values},target {type,data,id},reason}}","variables":{"id":"'+username+'"}}';
	const res = await axios.post(`https://api.7tv.app/v2/gql`, data, {
		headers: {
			'User-Agent': 'tm-stream-utils/0.1.0 +https://github.com/danilotitato/TM-stream-utils',
			'Accept': 'application/json, text/plain, */*',
			'Accept-Language': 'fr',
			'Authorization': '',
			'Content-Type': 'application/json',
			'Origin': 'https://7tv.app',
			'DNT': '1',
			'Connection': 'keep-alive',
			'Sec-Fetch-Dest': 'empty',
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Site': 'same-site',
			'Cache-Control': 'max-age=0',
			'TE': 'trailers'
		},
	})
	.catch(err => {
		console.log(err.message)
		return 'Error fetching 7tv emotes.'
	})

	if(typeof res.data.data.user === 'undefined'){
		return 'User doesn\'t exists.'
	}else{
		if(res.data.data.user.emotes.length == 0){
			return 'User doesn\'t have emote'
		}else{
			var seventvEmoteList = []

			res.data.data.user.emotes.forEach(emote => {
				seventvEmoteList.push(emote['name'])
			})
		
			let emotes = seventvEmoteList.join(' ')
			var pages = await splitByCharNbr(emotes, 380)
			if(page > pages.length){
				page = pages.length
			}
			let intro = await getIntroText(page, pages)
			return intro+pages[page-1]
		}
	}

	return res.data
}

const getBTTVEmote = async (username, page) => {
	let twitchID = await twitchUsernameToTwitchID(username)
	const res = await axios.get(`https://api.betterttv.net/3/cached/users/twitch/${twitchID}`, {
		headers: {
			'User-Agent': 'tm-stream-utils/0.1.0 +https://github.com/danilotitato/TM-stream-utils',
			'Accept': 'application/json, text/plain, */*',
    		'Content-Type': 'application/json',
		},
	})
	.catch(err => {
		console.log(err.message)
		return 'Error fetching BetterTTV emotes.'
	})

	var bttvEmoteList = []

	if(typeof res.data.channelEmotes !== 'undefined'){
		res.data.channelEmotes.forEach(emote => {
			bttvEmoteList.push(emote['code'])
		})
	}

	if(typeof res.data.sharedEmotes !== 'undefined'){
		res.data.sharedEmotes.forEach(emote => {
			bttvEmoteList.push(emote['code'])
		})
	}

	if(bttvEmoteList.length == 0){
		return 'User doesn\'t have emote or is unrecognized.'
	}else{
		var pages = await splitByCharNbr(bttvEmoteList.join(' '), 380)
		if(page > pages.length){
			page = pages.length
		}
		let intro = await getIntroText(page, pages)
		return intro+pages[page-1]
	}
}

const getFFZEmote = async (username, page) => {
	let twitchID = await twitchUsernameToTwitchID(username)
	const res = await axios.get(`https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${twitchID}`, {
		headers: {
			'User-Agent': 'tm-stream-utils/0.1.0 +https://github.com/danilotitato/TM-stream-utils',
			'Accept': 'application/json, text/plain, */*',
    		'Content-Type': 'application/json',
		},
	})
	.catch(err => {
		console.log(err.message)
		return 'Error fetching FrankerFaceZ emotes.'
	})

	if(typeof res.data.message !== 'undefined'){
		return 'User doesn\'t have emote or is unrecognized.'
	}else{
		var ffzEmoteList = []

		res.data.forEach(emote => {
			ffzEmoteList.push(emote['code'])
		})

		var pages = await splitByCharNbr(ffzEmoteList.join(' '), 380)
		if(page > pages.length){
			page = pages.length
		}
		let intro = await getIntroText(page, pages)
		return intro+pages[page-1]
	}
}



module.exports = emoteList;
const express = require('express');
const router = express.Router();
const database = require('../../../../database');
const { POST } = require('../../../../models/post');
const path = require('path');
const auth = require('../../../../middleware/auth');

router.get('/', function (req, res) {
	res.redirect('/titles/show');
});

router.get('/css/:filename', function (req, res) {
	res.set('Content-Type', 'text/css');
	res.sendFile('/css/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/js/:filename', function (req, res) {
	res.set('Content-Type', 'application/javascript; charset=utf-8');
	res.sendFile('/js/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/images/:filename', function (req, res) {
	res.set('Content-Type', 'image/png');
	res.sendFile('/images/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/fonts/:filename', function (req, res) {
	res.set('Content-Type', 'font/woff');
	res.sendFile('/fonts/' + req.params.filename, {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/favicon.ico', function (req, res) {
	res.set('Content-Type', 'image/x-icon');
	res.sendFile('/images/favicon.ico', {root: path.join(__dirname, '../../../../webfiles/' + req.directory)});
});

router.get('/icons/:image_id.png', async function (req, res) {
	res.set('Content-Type', 'image/png');
	const community = await database.getCommunityByID(req.params.image_id.toString());
	if (community !== null && community.browser_icon) {
		if (community.browser_icon.indexOf('data:image/png;base64,') !== -1) {
			res.send(Buffer.from(community.browser_icon.replace('data:image/png;base64,',''), 'base64'));
		} else {
			res.send(Buffer.from(community.browser_icon, 'base64'));
		}
	} else {
		const user = await database.getUserSettings(req.params.image_id.toString());
		if (user !== null) {
			if (user.pfp_uri.indexOf('data:image/png;base64,') !== -1) {
				res.send(Buffer.from(user.pfp_uri.replace('data:image/png;base64,',''), 'base64'));
			} else {
				res.send(Buffer.from(user.pfp_uri, 'base64'));
			}
		} else {
			res.sendStatus(404);
		}
	}
});

router.get('/tip/:image_id.png', async function (req, res) {
	res.set('Content-Type', 'image/png');
	const community = await database.getCommunityByID(req.params.image_id.toString());
	if (community !== null) {
		if (community.browser_thumbnail.indexOf('data:image/png;base64,') !== -1) {
			res.send(Buffer.from(community.browser_thumbnail.replace('data:image/png;base64,',''), 'base64'));
		} else {
			res.send(Buffer.from(community.browser_thumbnail, 'base64'));
		}
	} else {
		const user = await database.getUserByPID(req.params.image_id.toString());
		if (user !== null) {
			if (user.pfp_uri.indexOf('data:image/png;base64,') !== -1) {
				res.send(Buffer.from(user.pfp_uri.replace('data:image/png;base64,', ''), 'base64'));
			} else {
				res.send(Buffer.from(user.pfp_uri, 'base64'));
			}
		} else {
			res.sendStatus(404);
		}
	}

});

router.get('/banner/:image_id.png', async function (req, res) {
	res.set('Content-Type', 'image/png');
	const community = await database.getCommunityByID(req.params.image_id.toString());
	if (community !== null && community.WiiU_browser_header !== undefined) {
		if (community.WiiU_browser_header.indexOf('data:image/png;base64,') !== -1) {
			res.send(Buffer.from(community.WiiU_browser_header.replace('data:image/png;base64,',''), 'base64'));
		} else {
			res.send(Buffer.from(community.WiiU_browser_header, 'base64'));
		}
	} else {
		res.sendStatus(404);
	}
});

router.get('/screenshot/:image_id.png', async function (req, res) {
	res.set('Content-Type', 'image/png');
	const post = await database.getPostByID(req.params.image_id.toString());
	if (post !== null && post.screenshot !== '') {
		if (post.screenshot.indexOf('data:image/png;base64,') !== -1) {
			res.send(Buffer.from(post.screenshot.replace('data:image/png;base64,',''), 'base64'));
		} else {
			res.send(Buffer.from(post.screenshot, 'base64'));
		}
	} else {
		res.sendStatus(404);
	}
});

router.get('/drawing/:image_id.png', async function (req, res) {
	res.set('Content-Type', 'image/png');
	const post = await database.getPostByID(req.params.image_id.toString());
	if (post !== null && post.painting_uri !== '') {
		if (post.painting_uri.indexOf('data:image/png;base64,') !== -1) {
			res.send(Buffer.from(post.painting_uri.replace('data:image/png;base64,',''), 'base64'));
		} else {
			res.send(Buffer.from(post.painting_uri, 'base64'));
		}
	} else {
		res.sendStatus(404);
	}
});

router.get('/notifications.json', auth, async function (req, res) {
	const notifications = await database.getUnreadNotificationCount(req.pid);
	const messagesCount = await database.getUnreadConversationCount(req.pid);
	res.send(
		{
			message_count: messagesCount,
			notification_count: notifications,
		}
	);
});

router.get('/:post_id/oembed.json', auth, async function (req, res) {
	const post = await database.getPostByID(req.params.post_id.toString());
	const doc = {
		'author_name': post.screen_name,
		'author_url': 'https://juxt.pretendo.network/users/show?pid=' + post.pid,
	};
	res.send(doc);
});

router.get('/downloadUserData.json', auth, async function (req, res) {
	res.set('Content-Type', 'text/json');
	res.set('Content-Disposition', `attachment; filename="${req.pid}_user_data.json"`);
	const posts = await POST.find({ pid: req.pid });
	const userContent = await database.getUserSettings(req.pid);
	const userSettings = await database.getUserContent(req.pid);
	const doc = {
		'user_content': userContent,
		'user_settings': userSettings,
		'posts': posts,
	};
	res.send(doc);
});

module.exports = router;

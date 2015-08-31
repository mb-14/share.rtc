window.onload = init;
window.onunload = window.onbeforeunload = closeConnection;
var peer;
var connection;
var myNickname;
var roomLink;
var input;
var messagebox;
var footer;
function init(){
	initDomElements();
	initPeer();

	myNickname = prompt("Please enter a nick name", "anon");
	if(myNickname == null)
		myNickname = "anon"
}

function initPeer(id){
	if(id)
		peer = new Peer(id, {key: 'mycq6ayinh7x2yb9'});
	else
		peer = new Peer({key: 'mycq6ayinh7x2yb9'});

	peer.on('open',onOpen);
}
function initDomElements(){
	roomLink = document.getElementById('room-link');
	input = document.getElementById('chatinput');
	messagebox = document.getElementById('messages');
	footer = document.getElementById('footer');
	resizeScrollbar();

}
function resizeScrollbar(){
	messagebox.style.height = getTop(footer) - getTop(messagebox) +'px';
}
function getTop( el ) {
    var _y = 0;
    while( el && !isNaN( el.offsetTop ) ) {
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return _y;
}

function onOpen(id){

	input.onkeydown = onKeyDown;

	if(location.hash == ''){
		location.hash = id;
		roomLink.innerHTML = "Invite: <a href=\""+location.href+"\">"+ location.href+"</a>";
		resizeScrollbar();
		//Handle incoming connections
		console.log("Waiting for peers...");
		peer.on('connection', onPeerConnect);
	}
	else{
		console.log("Connecting to peer...");
		var conn = peer.connect(location.hash.substring(1));
		conn.on('open', function(){
			onPeerConnect(conn)
		});
	}
}

function onPeerConnect(conn){
		console.log("connected");
		connection = conn;
		connection.on('data', onReceive);
		connection.on('close', onConnectionClose);
		setTimeout(function(){
			connection.send({nick: '*' , text: myNickname+" has joined."});
			}
		,1000);
}


function onKeyDown(e){
	if (e.keyCode == 13 /* ENTER */ && !e.shiftKey) {
		e.preventDefault();
		var text = e.target.value
		e.target.value = ''
		sendMessage(text);
	}
}
function onReceive(data){
		appendMessage(data.nick, data.text);
}
function sendMessage(message){
	if(message != ''){
		if(connection){
		connection.send({nick: myNickname , text: message});
		}
		appendMessage(myNickname , message);
	}
}
function appendMessage(nick, message){
	var messageEl = document.createElement('div');
 	messageEl.classList.add('message');
	if (nick == myNickname) {
		messageEl.classList.add('me');
	}
	else if (nick == '*') {
		messageEl.classList.add('info');
	}
	var spanEl = document.createElement('span');
	spanEl.classList.add('nick');
	messageEl.appendChild(spanEl);
	spanEl.textContent = nick;
	var textEl = document.createElement('span');
	textEl.classList.add('text');
	textEl.textContent = message || '';
	textEl.innerHTML = textEl.innerHTML.replace(/(\?|https?:\/\/)\S+?(?=[,.!?:)]?\s|$)/g, parseLinks)
	messageEl.appendChild(textEl);
	messagebox.appendChild(messageEl);
	messagebox.scrollTop = messagebox.scrollHeight;
}


function parseLinks(g0) {
	var a = document.createElement('a');
	a.innerHTML = g0;
	var url = a.textContent;
	a.href = url;
	a.target = '_blank';
	return a.outerHTML
}

function onConnectionClose(){
		connection = null;
		peer.destroy();
		while(!peer.destroyed);

		peer = null;
		initPeer(location.hash.substring(1));
		location.hash = '';
}

function closeConnection(){
	if(connection){
		connection.sendMessage({nick: '!' , text: myNickname+" has left."});
		connection.close();
	}
	peer.destroy();
}

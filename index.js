require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
var req   = require('request'),
    exec  = require('child_process').exec,
    fs    = require('fs'),
    items = require('./items.json'),
    ctr   = 0;
	count = 0;
	const fetch = require('node-fetch');
	const jsdom = require('jsdom');
	const {JSDOM} = jsdom;

	const CaptchaSolver = require('captcha-solver');

	const spawn = require('child_process').spawn;
	const pythonSolver = spawn('python', ["./capSolver/solver.py"]);

	let {PythonShell} = require("python-shell");
	
	var httpProxy = require('http-proxy');
	var http = require('http');
	
	var returnArray = [2];
	var proxyArray = [20];
	var portArray = [20];

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {

  if (msg.content.startsWith('!scrape')) {
	  msg.channel.send("Running amazon scraper...");
	  getProxies(0)
    setCount(msg);
	setInterval(function() {
		//ctr = 0;
		//getItem();
	setCount(msg);
}, 500);
  }
});


function setCount(msg){
	
	if(count > items.length)
	{
		count = 0;
		getProxies(1);
	}
	var fullArray = returnArray;
	getItem(count, msg, fullArray);
	count++;
}

function getProxies(num){
	if(num==0)
	{
		req.get('https://free-proxy-list.net/', function(err, res, body)
		{
			if (err) return false;
		
			//console.log("getting proxies...");
			var domBody = new JSDOM(body);
		
			var proxyTable = domBody.window.document.getElementById("proxylisttable").childNodes[1].childNodes;
		
			for (i = 0; i<proxyTable.length; i++)
			{
				var ip = proxyTable[i].childNodes[0].textContent;
				var port = proxyTable[i].childNodes[1].textContent;
			
				proxyArray[i] = ip;
				portArray[i] = port;
			
			}
				//return [proxyArray, portArray];
			});
	}
	else{
		returnArray[0] = proxyArray[num];
		returnArray[1] = portArray[num];
	}
	
	
	return returnArray;
}

function getItem(count, msg, fullArray) {
	if(count < items.length)
	{
		var avail;
		var headers = {
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
		}
		//msg.channel.send(count + "/" + items.length + " Running URL for Item: " + items[count].name + " and URL: " + items[count].url);
		console.log(count + "/" + items.length + " Running URL for Item: " + items[count].name + " and URL: " + items[count].url);
		//proxy: fullArray[0]+":"+fullArray[1]
		req.get({url: items[count].url, headers: headers}, function(err, res, body) {
			if (err) return false;
			//console.log(body);
			dom = new JSDOM(body);
			//console.log(body);
			var elm = dom.window.document.getElementsByClassName('a-size-medium a-color-success');
			//var botCheck = dom.window.document.getElementsByClassName('a-last');
			if(body != null)
			{
				if(body.includes("Sorry, we just need to make sure you're not a robot. For best results, please make sure your browser is accepting cookies."))
				{
					//msg.channel.send("Bot Detected for this URL: " + items[count].url);
					console.log("detected");
					//console.log(fullArray);
					//var ips = fullArray[0];
					//console.log("ips: " +ips[0]);
					//var ports = fullArray[1];
					//console.log("ports: " +ports.length);
					var rand = Math.floor(Math.random()*40)+1;
					
					//--- RUN PROXY FROM START TO REDUCE LATENCY ---
					var proxyOptions = {
						url: items[count].url,
						proxy: fullArray[rand]+":"+fullArray[rand+1]
					};
					
					/*req.get(proxyOptions, function(err,response,body)
					{
						if (err) return false;
						console.log("proxy accepted");
					});*/

					
					
					
					
					
					//--- CAPTCHA SOLVER | NEEDS WORK ---
					var cap = dom.window.document.getElementsByClassName("a-row a-text-center"); //--- does not get url yet ---
					if(cap.length != 0)
					{
					//console.log(cap[1].innerHTML);

					var subCap = cap[1].innerHTML.split('=\"').pop().split('\">').toString();
					subCap = subCap.replace(",", "")
					subCap = subCap.replace("\n", "")
					//console.log("cap url: " + subCap);
					var solvedCap;
					var options = {mode: 'text',
					pythonOptions: ['-u'], // get print results in real-time
					args: [subCap]};

					PythonShell.run('./capSolver/solver.py', options, function(err, results)
					{
						if(err) throw err;
						//console.log("cap: " + results);
						solvedCap = results;
					});

					dom.window.document.getElementById('captchacharacters').value = solvedCap;
					//dom.window.document.getElementsByClassName('a-button-text')[0].click();
					dom.window.HTMLFormElement.prototype.submit = () => {}
					console.log("submitted");
					//dom.window.document.querySelector('.a-button-text').click();

					}

				
				}
				else{
					console.log("Successful process...");
				}

			}
			//console.log(elm.innerHTML);
			avail = elm.length !==0
			//console.log(avail);
			if(elm.length != 0 && !items[count].instock)
			{
				//--- listing ---
				console.log('[%s] %s', new Date().toISOString(), items[count].name);
				//msg.channel.send("GPU Listing: " + items[count].name + " URL: " + items[count].url);
				msg.channel.send({embed: {
					color: 3447003,
					title: "New Listing",
					url: items[count].url,
					description: "New Listing for GPU",
					timestamp: new Date()
				}
				});
				var price = dom.window.document.getElementById('priceblock_ourprice');
				if(price != null)
				{
					//--- actual gpu ---
					console.log('[%s] %s %s', new Date().toISOString(), items[count].name, price.innerHTML.toString());
					//msg.channel.send("New GPU: " + items[count].name +": " + price.innerHTML.toString() + "URL: " + items[count].url);
					msg.channel.send({embed: {
					color: 3447003,
					title: "New GPU",
					url: items[count].url,
					description: "New GPU found",
					timestamp: new Date()
					}
					});
				}
			}
			var price = dom.window.document.getElementById('priceblock_ourprice');
			//--- actual gpu ---
			if(price != null)
				{
					console.log('[%s] %s %s', new Date().toISOString(), items[count].name, price.innerHTML.toString());
					//msg.channel.send("New GPU: " + items[count].name +": " + price.innerHTML.toString() + "URL: " + items[count].url);
					msg.channel.send({embed: {
					color: 3447003,
					title: "New GPU",
					url: items[count].url,
					description: "New GPU found",
					timestamp: new Date()
					}
					});
				}
			items[count].instock = avail;
			fs.writeFile('items.json', JSON.stringify(items, null, '  '), () => {});
		});


	}
}

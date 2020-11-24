# Rewriter
## Version 4.0 : 2016/11/18

ADD
- The ability to forward the complete path of the received request to the new destination
  the $1 string is replaced by the complete request.path

Ex : www.toto.com,http://toto.cutugnio.it$1

will transform the request  
www.toto.com/my/beautyful/song  
  into     
http://toto.cutugnio.it/my/beautyful/song

## Version 3.0 :
Work with nodes LTS
and some code review 
But i'm a poor documenter and I cannot remember it.


## Version 2.0 : 2016/05/15
CHANGES
 - Change diretory structure
  * ./files : contains url list (can be change in config)
    Personnally I split the list by first letter of the destination url without www prefix
    So a redirection of me.brussels to www.irisnet.be/me goes in the i.conf file
    Be carefull this file MUST be a linux format (no CRLF, but LF only)

  * ./blacklist contains refused ip list (can be change in config)
 - Change application main file (app.js)

ADD
- Add config.js file
- Add ability to read multiple config files for url list 
- Add a test url (default /rwtst but you can change it)
  - send a request http://myserver/rwtst?www.myold.site will redirect you to the ad-hoc response
    if not .... Houston we have...


## Version 1.5

ADD
- Allow punycode url 
  Because i'm living in a french country, and my user like accents

## Version 1.0

This is a simple url rewriter  
It does only this but it does well.

I use this in  production with more than 500 rewriting rules and i never stopped the server.

Be careful, the 2 config files MUST exist before the launch of the program
If not, the server is crashing 


## Requirements
* Running on linux (we use the grep command)
* Node js > 0.4.x

##Installation 
* Git clone ....
* cd  inthedirectory
* npm install . ( to install dependencies)

## Running
* simple 

  nohup node app.js >/var/log/pxy.log &

* More stable

  Use PM2 to start the program in cluster mode
  (https://github.com/Unitech/PM2)
  pm2 start app.js -i 0 --name rewriter
  don't forget a pm2 startup and a pm2 save..... it can be helpfull when you have a reboot

Personally i protect it with a nginx, but i'm sure you can do without it

## Features:
* You can change the listening port (8080)
* You can change all messages
* You can change the (basic) rest Url who's giving the list of rewriting rules
* IDN name are accepted: have a look in the sample config file


## Not in:
* Statistics
* Rest CRUD 

If you have time to work on, please do.

Ph Koenig - aka Unclephil
http://tc.unclephil.net

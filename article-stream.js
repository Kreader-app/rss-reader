var feed = require('feed-read'),  // require the feed-read module
    http = require("http"),
    port = process.env.PORT || 5000, // allow heroku/nodejitsu to set port
    url = require("url");

// load css styles
  var css = '<style type="text/css">' +require('fs').readFileSync('./style.css').toString() + '</style>'

http.createServer(function (req, res) {
  // send basic http headers to client
  res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Transfer-Encoding": "chunked"
  });


// Fetch RSS URL

  const queryObject = url.parse(req.url,true).query;

  // setup simple html page:
  res.write("<html>\n<head>\n<title>RSS Feed - " + queryObject.url + "</title>\n" +css +"</head>\n<body>");


// Load article description content by default. Turn off by appending no_content to URL
var descriptions = true;

if(typeof queryObject.no_content !== "undefined")
{
	descriptions = false;
}
  



// Check if URL is defined
if(typeof queryObject.url !== "undefined")
{
        console.log(queryObject.url);
	

    // fetch rss feed for the url:
    feed(queryObject.url, function(err, articles) {



// Check if articles are defined
if(typeof articles !== "undefined")
{
      // loop through the list of articles returned
      for (var i = 0; i < articles.length; i++) {

        // stream article title (and what ever else you want) to client
        displayArticle(res, articles[i], descriptions);

        // check we have reached the end of our list of articles & urls
        if( i === articles.length-1 ) {
          res.end("</body>\n</html>"); // end http response
        } // else still have rss urls to check
      } //  end inner for loop
} // end undefined articles check
else { res.write("<strong>NO ARTICLES! - CHECK URL: " + queryObject.url + "</strong>");  }

      
    }); // end call to feed (feed-read) method

} // end undefined URL check
else { res.write("<strong>NO RSS FEED URL!</strong>")  }



  setTimeout(function() {

          
    res.end("</body>\n</html>"); // end http response
  }, 4000);

}).listen(port);
console.log("HTTP Listening on: http://localhost:"+port);

// a mini-rendering function - you can expand this or add html markup
function displayArticle(res, a, content) {

  var author = a.author || a.feed.name; // some feeds don't have author (BBC!)
  // send the article content to client
  res.write('<div class="article">')
  res.write("<strong>"+a.title +" | </strong>");
  res.write("<a href="+a.link +"> Link</a>");
  res.write(" | ");
  res.write("<a href=\"http://www.printfriendly.com/print/?source=homepage&url="  +a.link +"\"> Reader mode</a><br>");
	if(content){
		res.write(a.content);
	}
  res.write("</p></div>\n");	
  res.write('<div class="spacer"><br></div>\n');
}

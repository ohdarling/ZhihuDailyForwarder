var express = require('express'),
    request = require('request');

var app = express.createServer(
    express.logger()
);

function forwardRequest(url, res, bodyCallback) {
    request(url, function(error, response, body) {
        if (bodyCallback) {
            body = bodyCallback(body);
        }

        var headers = {
            "Content-Length" : Buffer.byteLength(body)
        };
        res.writeHead(response.statusCode, headers);
        res.end(body);
    });
}

app.get('/', function(req, res) {
    console.log(req.url);
    forwardRequest('http://news.at.zhihu.com/api/1.1/news/latest', res, function(body) {
        var json = JSON.parse(body);
        json.news.concat(json.top_stories).forEach(function(item, idx) {
            item.items.forEach(function(e) {
                e.share_url = 'http://' + req.headers.host + '/story?url=' + e.share_url;
            });
        });
        return JSON.stringify(json);
    });
});

app.get('/story', function(req, res) {
    forwardRequest(req.query.url, res);
});

app.listen(8080);

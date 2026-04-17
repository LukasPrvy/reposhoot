const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

function sanitizeContent(content) {
  return content.replace(/[^\x20-\x7E\n\t]/g, '?');
}

function startServer(filePaths, port, onListening) {
  const gameDir = path.join(__dirname, 'game');

  // Lazy line reader: reads files from disk as needed
  var allLines = [];
  var nextFileIndex = 0;
  var allFilesRead = false;

  function ensureLines(needed) {
    while (allLines.length < needed && !allFilesRead) {
      if (nextFileIndex >= filePaths.length) {
        allFilesRead = true;
        break;
      }
      var file = filePaths[nextFileIndex++];
      try {
        var content = fs.readFileSync(file.fullPath, 'utf8');
        content = sanitizeContent(content);
        allLines.push(
          '// \u2500\u2500\u2500 ' + file.name + ' \u2500\u2500\u2500',
        );
        var lines = content.split('\n');
        for (var i = 0; i < lines.length; i++) {
          allLines.push(lines[i]);
        }
      } catch (e) {}
    }
  }

  function handleRequest(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Code streaming endpoint
    if (req.url.startsWith('/api/code/stream')) {
      var urlObj = new URL(req.url, 'http://localhost');
      var offset = parseInt(urlObj.searchParams.get('offset') || '0', 10);
      var limit = parseInt(urlObj.searchParams.get('limit') || '100', 10);
      limit = Math.min(limit, 500);

      // Read enough files to satisfy the request
      ensureLines(offset + limit);

      var total = allLines.length;
      var lines = [];
      if (total > 0) {
        for (var i = 0; i < limit; i++) {
          var idx = offset + i;
          if (allFilesRead) {
            // All files exhausted — wrap around
            lines.push(allLines[idx % total]);
          } else if (idx < total) {
            lines.push(allLines[idx]);
          } else {
            break;
          }
        }
      }

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(
        JSON.stringify({
          lines: lines,
          total: total,
          offset: offset,
          hasMore: !allFilesRead || offset + limit < total,
        }),
      );
      return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    filePath = path.join(gameDir, filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      res.setHeader('Content-Type', contentType);
      res.writeHead(200);
      res.end(data);
    });
  }

  function tryListen(currentPort, maxPort) {
    const server = http.createServer(handleRequest);

    server.listen(currentPort, () => {
      if (onListening) onListening(currentPort);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && currentPort < maxPort) {
        tryListen(currentPort + 1, maxPort);
      } else {
        if (onListening) onListening(null, err);
      }
    });
  }

  tryListen(port, port + 10);
}

module.exports = {startServer};

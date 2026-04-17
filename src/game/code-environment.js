var RS = RS || {};

RS.CodeEnv = {
  leftLines: [],
  rightLines: [],
  leftGrid: [],
  rightGrid: [],
  leftEdges: [],
  rightEdges: [],
  scrollY: 0,
  scrollSpeed: 1.25,
  rightRowOffset: 8,
  wallCanvasWidth: 350,
  leftCanvas: null,
  rightCanvas: null,
  leftDirty: true,
  rightDirty: true,
  leftDirtyRows: new Set(),
  rightDirtyRows: new Set(),
  starfield: [],
  loaded: false,
  totalRows: 0,

  // Streaming state
  fetchedOffset: 0,
  rightFetchedOffset: 0,
  lineBuffer: [],
  rightLineBuffer: [],
  fetching: false,
  rightFetching: false,
  topRowIndex: 0,
  absoluteScroll: 0,

  init: async function () {
    // Init starfield
    this.starfield = [];
    for (var i = 0; i < 200; i++) {
      this.starfield.push({
        x: Math.random() * RS.GAME_WIDTH,
        y: Math.random() * RS.GAME_HEIGHT,
        brightness: 0.1 + Math.random() * 0.5,
        speed: 0.2 + Math.random() * 0.8,
        size: 0.5 + Math.random() * 1.5,
      });
    }

    try {
      var response = await fetch('/api/code/stream?offset=0&limit=200');
      var data = await response.json();
      this.lineBuffer = data.lines || [];
      this.fetchedOffset = this.lineBuffer.length;
    } catch (e) {
      console.error('Failed to load code:', e);
      this.lineBuffer = [];
    }

    var placeholder = [
      '// No code loaded',
      'function init() {',
      '    console.log("RepoShoot");',
      '    return true;',
      '}',
    ];

    if (this.lineBuffer.length === 0) {
      this.lineBuffer = placeholder.slice();
    }

    // Fetch separate content for right wall
    try {
      var rightOffset = Math.max(200, this.fetchedOffset);
      var response2 = await fetch(
        '/api/code/stream?offset=' + rightOffset + '&limit=200',
      );
      var data2 = await response2.json();
      this.rightLineBuffer = data2.lines || [];
      this.rightFetchedOffset = rightOffset + this.rightLineBuffer.length;
    } catch (e2) {
      this.rightLineBuffer = [];
    }

    if (this.rightLineBuffer.length === 0) {
      this.rightLineBuffer = placeholder.slice();
    }

    this.buildInitialGrids();
    this.loaded = true;
  },

  buildInitialGrids: function () {
    var maxCanvasRows = Math.floor(16000 / RS.CHAR_HEIGHT);
    // Consume initial lines from buffer into grid
    var initialRows = Math.min(
      Math.max(80, Math.ceil((RS.GAME_HEIGHT * 2) / RS.CHAR_HEIGHT)),
      maxCanvasRows,
    );
    initialRows = Math.min(
      initialRows,
      Math.max(this.lineBuffer.length, this.rightLineBuffer.length),
    );

    this.leftLines = this.lineBuffer.splice(0, initialRows);
    this.rightLines = this.rightLineBuffer.splice(0, initialRows);
    while (this.leftLines.length < initialRows) this.leftLines.push('');
    while (this.rightLines.length < initialRows) this.rightLines.push('');
    this.totalRows = this.leftLines.length;
    this.topRowIndex = 0;
    this.absoluteScroll = 0;
    this.scrollY = 0;

    this.leftGrid = this.buildGrid(this.leftLines, 'left');
    this.rightGrid = this.buildGrid(this.rightLines, 'right');

    // Compute edges
    var leftScale = 0.68;
    var rightScale = 0.73;
    this.leftEdges = [];
    for (var r = 0; r < this.totalRows; r++) {
      var contentLen = this.getRowContentLength(this.leftGrid[r]);
      this.leftEdges.push(
        Math.max(0, Math.floor(contentLen * RS.CHAR_WIDTH * leftScale)),
      );
    }
    this.rightEdges = [];
    for (var rr = 0; rr < this.totalRows; rr++) {
      var rContentLen = this.getRowContentLength(this.rightGrid[rr]);
      var rContentStart = this.getRowContentStart(this.rightGrid[rr]);
      var rVisualLen = rContentLen - rContentStart;
      this.rightEdges.push(
        Math.max(0, Math.floor(rVisualLen * RS.CHAR_WIDTH * rightScale)),
      );
    }

    // Corridor enforcement
    var minCorridor = RS.MIN_CORRIDOR_WIDTH;
    for (var er = 0; er < this.totalRows; er++) {
      var rIdx = Math.min(er + this.rightRowOffset, this.totalRows - 1);
      var lE = this.leftEdges[er];
      var rE = this.rightEdges[rIdx];
      var combined = lE + rE;
      var maxCombined = RS.GAME_WIDTH - minCorridor;
      if (combined > maxCombined && combined > 0) {
        var scale = maxCombined / combined;
        this.leftEdges[er] = Math.floor(lE * scale);
        this.rightEdges[rIdx] = Math.floor(rE * scale);
      }
    }

    this._jitterEdges(this.leftEdges, this.wallCanvasWidth);
    this._jitterEdges(this.rightEdges, this.wallCanvasWidth);

    // Offscreen canvases
    var fullWallPx = RS.CODE_WALL_CHARS * RS.CHAR_WIDTH;
    this.leftCanvas = document.createElement('canvas');
    this.leftCanvas.width = fullWallPx;
    this.leftCanvas.height = this.totalRows * RS.CHAR_HEIGHT;

    this.rightCanvas = document.createElement('canvas');
    this.rightCanvas.width = fullWallPx;
    this.rightCanvas.height = this.totalRows * RS.CHAR_HEIGHT;

    this.leftDirtyRows = new Set();
    this.rightDirtyRows = new Set();
    for (var j = 0; j < this.totalRows; j++) {
      this.leftDirtyRows.add(j);
      this.rightDirtyRows.add(j);
    }
    this.leftDirty = true;
    this.rightDirty = true;
  },

  // Append new rows from lineBuffer as needed
  _appendRows: function (count) {
    if (this.lineBuffer.length === 0 && this.rightLineBuffer.length === 0)
      return 0;
    var toAdd = Math.min(
      count,
      Math.max(this.lineBuffer.length, this.rightLineBuffer.length),
    );
    var newLeftLines = this.lineBuffer.splice(0, toAdd);
    var newRightLines = this.rightLineBuffer.splice(0, toAdd);
    while (newLeftLines.length < toAdd) newLeftLines.push('');
    while (newRightLines.length < toAdd) newRightLines.push('');
    var leftScale = 0.68;
    var rightScale = 0.73;
    var minCorridor = RS.MIN_CORRIDOR_WIDTH;

    for (var i = 0; i < toAdd; i++) {
      var leftLine = newLeftLines[i];
      var rightLine = newRightLines[i];
      this.leftLines.push(leftLine);
      this.rightLines.push(rightLine);

      var leftRow = this._buildSingleRow(leftLine, 'left');
      var rightRow = this._buildSingleRow(rightLine, 'right');
      this.leftGrid.push(leftRow);
      this.rightGrid.push(rightRow);

      var lContentLen = this.getRowContentLength(leftRow);
      var lEdge = Math.max(
        0,
        Math.floor(lContentLen * RS.CHAR_WIDTH * leftScale),
      );

      var rContentLen = this.getRowContentLength(rightRow);
      var rContentStart = this.getRowContentStart(rightRow);
      var rVisualLen = rContentLen - rContentStart;
      var rEdge = Math.max(
        0,
        Math.floor(rVisualLen * RS.CHAR_WIDTH * rightScale),
      );

      // Corridor enforcement
      var combined = lEdge + rEdge;
      var maxCombined = RS.GAME_WIDTH - minCorridor;
      if (combined > maxCombined && combined > 0) {
        var s = maxCombined / combined;
        lEdge = Math.floor(lEdge * s);
        rEdge = Math.floor(rEdge * s);
      }

      this.leftEdges.push(lEdge);
      this.rightEdges.push(rEdge);
      this.totalRows++;

      // Mark new row dirty
      var newIdx = this.totalRows - 1;
      this.leftDirtyRows.add(newIdx);
      this.rightDirtyRows.add(newIdx);
    }

    // Resize canvases if needed
    var requiredHeight = this.totalRows * RS.CHAR_HEIGHT;
    if (this.leftCanvas && this.leftCanvas.height < requiredHeight) {
      this._resizeCanvas('left', requiredHeight);
    }
    if (this.rightCanvas && this.rightCanvas.height < requiredHeight) {
      this._resizeCanvas('right', requiredHeight);
    }

    this.leftDirty = true;
    this.rightDirty = true;
    return toAdd;
  },

  _resizeCanvas: function (side, newHeight) {
    var canvas = side === 'left' ? this.leftCanvas : this.rightCanvas;
    var newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width;
    newCanvas.height = newHeight;
    var ctx = newCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    if (side === 'left') {
      this.leftCanvas = newCanvas;
      for (var r = 0; r < this.totalRows; r++) this.leftDirtyRows.add(r);
    } else {
      this.rightCanvas = newCanvas;
      for (var r = 0; r < this.totalRows; r++) this.rightDirtyRows.add(r);
    }
  },

  fetchNextBatch: function () {
    var self = this;
    if (!this.fetching && this.lineBuffer.length < 30) {
      this.fetching = true;
      fetch('/api/code/stream?offset=' + this.fetchedOffset + '&limit=100')
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          if (data.lines && data.lines.length > 0) {
            for (var i = 0; i < data.lines.length; i++) {
              self.lineBuffer.push(data.lines[i]);
            }
            self.fetchedOffset += data.lines.length;
          }
          self.fetching = false;
        })
        .catch(function () {
          self.fetching = false;
        });
    }
    if (!this.rightFetching && this.rightLineBuffer.length < 30) {
      this.rightFetching = true;
      fetch('/api/code/stream?offset=' + this.rightFetchedOffset + '&limit=100')
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          if (data.lines && data.lines.length > 0) {
            for (var i = 0; i < data.lines.length; i++) {
              self.rightLineBuffer.push(data.lines[i]);
            }
            self.rightFetchedOffset += data.lines.length;
          }
          self.rightFetching = false;
        })
        .catch(function () {
          self.rightFetching = false;
        });
    }
  },

  _buildSingleRow: function (line, side) {
    var processed;
    if (side === 'right') {
      if (line.length > RS.CODE_WALL_CHARS) {
        processed = line.substring(0, RS.CODE_WALL_CHARS);
      } else {
        processed = line;
      }
    } else {
      processed = line.replace(/^\s+/, '');
      if (processed.length > RS.CODE_WALL_CHARS) {
        processed = processed.substring(processed.length - RS.CODE_WALL_CHARS);
        var breakIdx = processed.search(
          /[\s\.\,\;\(\)\{\}\[\]\=\+\-\*\/\<\>\!\&\|\^]/,
        );
        if (breakIdx > 0 && breakIdx < 10) {
          processed = processed.substring(breakIdx);
        }
      }
    }

    var highlighted = this.highlightLine(processed);
    var cells = [];
    for (var col = 0; col < RS.CODE_WALL_CHARS; col++) {
      if (col < highlighted.length) {
        cells.push({
          char: highlighted[col].char,
          color: highlighted[col].color,
          alive: true,
          alpha: 1.0,
        });
      } else {
        cells.push({
          char: ' ',
          color: RS.Colors.text,
          alive: true,
          alpha: 1.0,
        });
      }
    }
    return cells;
  },

  getRowContentLength: function (row) {
    if (!row) return 0;
    var len = 0;
    for (var c = row.length - 1; c >= 0; c--) {
      if (row[c].char !== ' ') {
        len = c + 1;
        break;
      }
    }
    return len;
  },

  getRowContentStart: function (row) {
    if (!row) return 0;
    for (var c = 0; c < row.length; c++) {
      if (row[c].char !== ' ') return c;
    }
    return row.length;
  },

  _jitterEdges: function (edges, maxEdge) {
    var runStart = 0;
    for (var i = 1; i <= edges.length; i++) {
      if (i < edges.length && edges[i] === edges[runStart]) continue;
      var runLen = i - runStart;
      if (runLen >= 2) {
        for (var j = runStart; j < i; j++) {
          if ((j - runStart) % 2 === 0) continue;
          var shift = (1 + Math.floor(Math.random() * 3)) * RS.CHAR_WIDTH;
          edges[j] = Math.max(25, edges[j] - shift);
        }
      }
      runStart = i;
    }
  },

  buildGrid: function (lines, side) {
    var grid = [];
    for (var row = 0; row < lines.length; row++) {
      grid.push(this._buildSingleRow(lines[row] || '', side));
    }
    return grid;
  },

  highlightLine: function (line) {
    var result = [];
    var keywords = [
      'function',
      'class',
      'const',
      'let',
      'var',
      'if',
      'else',
      'for',
      'while',
      'return',
      'import',
      'export',
      'from',
      'new',
      'this',
      'null',
      'undefined',
      'true',
      'false',
      'async',
      'await',
      'try',
      'catch',
      'throw',
      'switch',
      'case',
      'break',
      'continue',
      'default',
      'extends',
      'implements',
      'interface',
      'type',
      'enum',
      'struct',
      'fn',
      'pub',
      'mod',
      'use',
      'def',
      'self',
      'yield',
      'lambda',
      'print',
      'None',
      'True',
      'False',
    ];
    var operators = '=+-*/<>!&|^~?:;,.[\\](){}';

    var i = 0;
    while (i < line.length) {
      var char = line[i];
      if (char === '/' && i + 1 < line.length && line[i + 1] === '/') {
        for (var j = i; j < line.length; j++) {
          result.push({char: line[j], color: RS.Colors.comment});
        }
        break;
      }
      if (char === '#') {
        for (var j2 = i; j2 < line.length; j2++) {
          result.push({char: line[j2], color: RS.Colors.comment});
        }
        break;
      }
      if (char === '"' || char === "'" || char === '`') {
        var quote = char;
        result.push({char: quote, color: RS.Colors.string});
        i++;
        var escaped = false;
        while (i < line.length) {
          var c = line[i];
          result.push({char: c, color: RS.Colors.string});
          if (escaped) {
            escaped = false;
          } else if (c === '\\') {
            escaped = true;
          } else if (c === quote) {
            i++;
            break;
          }
          i++;
        }
        continue;
      }
      if (/[0-9]/.test(char)) {
        result.push({char: char, color: RS.Colors.number});
        i++;
        while (
          i < line.length &&
          (/[0-9]/.test(line[i]) || line[i] === '.' || line[i] === 'x')
        ) {
          result.push({char: line[i], color: RS.Colors.number});
          i++;
        }
        continue;
      }
      if (/[a-zA-Z_]/.test(char)) {
        var word = char;
        var wi = i + 1;
        while (wi < line.length && /[a-zA-Z0-9_]/.test(line[wi])) {
          word += line[wi];
          wi++;
        }
        var wordColor =
          keywords.indexOf(word) !== -1 ? RS.Colors.keyword : RS.Colors.text;
        for (var k = 0; k < word.length; k++) {
          result.push({char: word[k], color: wordColor});
        }
        i = wi;
        continue;
      }
      if (operators.indexOf(char) !== -1) {
        result.push({char: char, color: RS.Colors.operator});
        i++;
        continue;
      }
      result.push({char: char, color: RS.Colors.text});
      i++;
    }
    return result;
  },

  renderToCache: function () {
    if (!this.leftDirty && !this.rightDirty) return;
    var font = '11px monospace';
    if (this.leftDirty && this.leftCanvas) {
      this._renderGridToCanvas(
        this.leftCanvas,
        this.leftGrid,
        this.leftDirtyRows,
        font,
        false,
      );
      this.leftDirty = false;
      this.leftDirtyRows.clear();
    }
    if (this.rightDirty && this.rightCanvas) {
      this._renderGridToCanvas(
        this.rightCanvas,
        this.rightGrid,
        this.rightDirtyRows,
        font,
        true,
      );
      this.rightDirty = false;
      this.rightDirtyRows.clear();
    }
  },

  _renderGridToCanvas: function (canvas, grid, dirtyRows, font, isRightWall) {
    var ctx = canvas.getContext('2d');
    ctx.font = font;
    var rows = dirtyRows.size > 0 ? dirtyRows : this._allRows();
    var self = this;
    var edgesArr = isRightWall ? self.rightEdges : self.leftEdges;

    rows.forEach(function (row) {
      if (row < 0 || row >= grid.length) return;
      var cells = grid[row];
      var y = row * RS.CHAR_HEIGHT;
      var edgePx = edgesArr[row] || 200;

      ctx.clearRect(0, y, canvas.width, RS.CHAR_HEIGHT);
      var contentPx = self.getRowContentLength(cells) * RS.CHAR_WIDTH;
      var contentStart = isRightWall ? self.getRowContentStart(cells) : 0;

      for (var col = 0; col < cells.length; col++) {
        var cell = cells[col];
        if (cell.char === ' ' && !cell.alive) continue;

        var x;
        if (isRightWall) {
          x =
            self.wallCanvasWidth -
            edgePx +
            (col - contentStart) * RS.CHAR_WIDTH;
          if (x < 0) continue;
          if (x >= self.wallCanvasWidth + RS.CHAR_WIDTH) break;
        } else {
          var shift = edgePx - contentPx;
          x = shift + col * RS.CHAR_WIDTH;
          if (x < 0) continue;
          if (x >= edgePx + RS.CHAR_WIDTH) break;
        }

        var distFromEdge;
        if (isRightWall) {
          distFromEdge = (self.wallCanvasWidth - x) / edgePx;
        } else {
          distFromEdge = x / edgePx;
        }
        var depthFactor = 0.25 + RS.clamp(distFromEdge, 0, 1) * 0.75;
        var alpha = cell.alpha * depthFactor;
        if (!cell.alive) alpha = cell.alpha * 0.5;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = cell.color;
        ctx.fillText(cell.char, x, y + RS.CHAR_HEIGHT - 2);
      }
    });
    ctx.globalAlpha = 1.0;
  },

  _allRows: function () {
    var s = new Set();
    for (var i = 0; i < this.totalRows; i++) s.add(i);
    return s;
  },

  update: function () {
    this.absoluteScroll += this.scrollSpeed;
    this.scrollY = this.absoluteScroll;

    // How many rows are visible
    var viewportRows = Math.ceil(RS.GAME_HEIGHT / RS.CHAR_HEIGHT) + 2;
    var bottomVisibleRow =
      Math.ceil(this.scrollY / RS.CHAR_HEIGHT) + viewportRows;

    // Append rows if we're getting close to the end of the grid
    var rowsAhead = this.totalRows - bottomVisibleRow;
    if (rowsAhead < 30) {
      this._appendRows(20);
    }

    // Fetch more lines from server if buffer is running low
    if (this.lineBuffer.length < 30 || this.rightLineBuffer.length < 30) {
      this.fetchNextBatch();
    }

    // Fade destroyed characters (no healing - destroyed cells stay destroyed)
    var visibleMinRow = Math.floor(this.scrollY / RS.CHAR_HEIGHT) - 2;
    var visibleMaxRow = bottomVisibleRow;
    var self = this;

    function fadeGrid(grid, dirtyRows) {
      for (
        var row = Math.max(0, visibleMinRow);
        row < Math.min(grid.length, visibleMaxRow);
        row++
      ) {
        var rowChanged = false;
        for (var col = 0; col < grid[row].length; col++) {
          var cell = grid[row][col];
          if (!cell.alive && cell.alpha > 0) {
            cell.alpha -= 0.02;
            if (cell.alpha < 0) cell.alpha = 0;
            rowChanged = true;
          }
        }
        if (rowChanged) dirtyRows.add(row);
      }
    }

    fadeGrid(this.leftGrid, this.leftDirtyRows);
    fadeGrid(this.rightGrid, this.rightDirtyRows);

    if (this.leftDirtyRows.size > 0) this.leftDirty = true;
    if (this.rightDirtyRows.size > 0) this.rightDirty = true;

    // Stars
    for (var s = 0; s < this.starfield.length; s++) {
      var star = this.starfield[s];
      star.y += star.speed;
      if (star.y > RS.GAME_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * RS.GAME_WIDTH;
      }
    }
  },

  getCorridorBounds: function (screenY) {
    if (!this.loaded || this.leftEdges.length === 0) {
      return {left: RS.CORRIDOR_LEFT, right: RS.CORRIDOR_RIGHT};
    }

    var rowF = (this.scrollY + RS.GAME_HEIGHT - screenY) / RS.CHAR_HEIGHT - 1;
    var row0 = Math.floor(rowF);
    var row1 = row0 + 1;
    var frac = rowF - row0;

    // Clamp to valid range
    row0 = RS.clamp(row0, 0, this.totalRows - 1);
    row1 = RS.clamp(row1, 0, this.totalRows - 1);

    var leftEdge =
      this.leftEdges[row0] * (1 - frac) + this.leftEdges[row1] * frac;

    var rRowF =
      (this.scrollY +
        this.rightRowOffset * RS.CHAR_HEIGHT +
        RS.GAME_HEIGHT -
        screenY) /
        RS.CHAR_HEIGHT -
      1;
    var rRow0 = Math.floor(rRowF);
    var rRow1 = rRow0 + 1;
    rRow0 = RS.clamp(rRow0, 0, this.totalRows - 1);
    rRow1 = RS.clamp(rRow1, 0, this.totalRows - 1);
    var rFrac = rRowF - Math.floor(rRowF);
    var rightEdge =
      this.rightEdges[rRow0] * (1 - rFrac) + this.rightEdges[rRow1] * rFrac;

    return {left: leftEdge, right: RS.GAME_WIDTH - rightEdge};
  },

  getCorridorBoundsRange: function (screenY, height) {
    var tightest = {left: 0, right: RS.GAME_WIDTH};
    var steps = Math.max(2, Math.ceil(height / RS.CHAR_HEIGHT));
    for (var i = 0; i <= steps; i++) {
      var y = screenY + (height * i) / steps;
      var b = this.getCorridorBounds(y);
      if (b.left > tightest.left) tightest.left = b.left;
      if (b.right < tightest.right) tightest.right = b.right;
    }
    return tightest;
  },

  isInsideWall: function (x, screenY) {
    var b = this.getCorridorBounds(screenY);
    if (x >= b.left && x <= b.right) return false;

    // Check if the grid cell at this position is still alive
    var isRight = x > b.right;
    var grid = isRight ? this.rightGrid : this.leftGrid;
    var baseScrollY = this.scrollY;
    if (isRight) baseScrollY += this.rightRowOffset * RS.CHAR_HEIGHT;
    var gridY = Math.floor(
      (baseScrollY + RS.GAME_HEIGHT - screenY) / RS.CHAR_HEIGHT - 1,
    );
    gridY = RS.clamp(gridY, 0, this.totalRows - 1);
    if (!grid[gridY]) return true;

    var gridX;
    if (isRight) {
      var centerEdge = this.rightEdges[gridY] || 200;
      var rStart = this.getRowContentStart(grid[gridY]);
      gridX =
        rStart + Math.floor((x - RS.GAME_WIDTH + centerEdge) / RS.CHAR_WIDTH);
    } else {
      var lEdgePx = this.leftEdges[gridY] || 0;
      var lContentPx = this.getRowContentLength(grid[gridY]) * RS.CHAR_WIDTH;
      var lShift = lEdgePx - lContentPx;
      gridX = Math.floor((x - lShift) / RS.CHAR_WIDTH);
    }

    if (gridX < 0 || gridX >= grid[gridY].length) return true;
    return grid[gridY][gridX].alive && grid[gridY][gridX].char !== ' ';
  },

  render: function (ctx) {
    // Starfield
    for (var s = 0; s < this.starfield.length; s++) {
      var star = this.starfield[s];
      ctx.globalAlpha = star.brightness;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    if (this.leftDirty || this.rightDirty) {
      this.renderToCache();
    }

    // Draw left wall
    if (this.leftCanvas) {
      var CH = RS.CHAR_HEIGHT;
      var wallW = this.leftCanvas.width;
      var firstRow = Math.floor(this.scrollY / CH);
      var lastRow = Math.ceil((this.scrollY + RS.GAME_HEIGHT) / CH);
      firstRow = Math.max(0, firstRow);
      lastRow = Math.min(this.totalRows - 1, lastRow);
      for (var r = firstRow; r <= lastRow; r++) {
        var srcY = r * CH;
        var normalScreenY = r * CH - this.scrollY;
        var dstY = RS.GAME_HEIGHT - normalScreenY - CH;
        ctx.drawImage(this.leftCanvas, 0, srcY, wallW, CH, 0, dstY, wallW, CH);
      }
    }

    // Draw right wall
    if (this.rightCanvas) {
      var CH2 = RS.CHAR_HEIGHT;
      var wallW2 = this.rightCanvas.width;
      var rightScrollY = this.scrollY + this.rightRowOffset * CH2;
      var rightX = RS.GAME_WIDTH - this.wallCanvasWidth;
      var firstRowR = Math.floor(rightScrollY / CH2);
      var lastRowR = Math.ceil((rightScrollY + RS.GAME_HEIGHT) / CH2);
      firstRowR = Math.max(0, firstRowR);
      lastRowR = Math.min(this.totalRows - 1, lastRowR);
      for (var rr = firstRowR; rr <= lastRowR; rr++) {
        var srcYR = rr * CH2;
        var normalScreenYR = rr * CH2 - rightScrollY;
        var dstYR = RS.GAME_HEIGHT - normalScreenYR - CH2;
        ctx.drawImage(
          this.rightCanvas,
          0,
          srcYR,
          wallW2,
          CH2,
          rightX,
          dstYR,
          wallW2,
          CH2,
        );
      }
    }
  },

  destroyAt: function (x, y, radius) {
    var destroyed = [];
    var self = this;
    var grid, dirtyFlag, dirtyRows, isRight;
    var bounds = this.getCorridorBounds(y);

    if (x < bounds.left + 20) {
      grid = this.leftGrid;
      dirtyFlag = 'leftDirty';
      dirtyRows = this.leftDirtyRows;
      isRight = false;
    } else if (x > bounds.right - 20) {
      grid = this.rightGrid;
      dirtyFlag = 'rightDirty';
      dirtyRows = this.rightDirtyRows;
      isRight = true;
    } else {
      return destroyed;
    }

    var baseScrollY = this.scrollY;
    if (isRight) {
      baseScrollY += this.rightRowOffset * RS.CHAR_HEIGHT;
    }
    var gridY = Math.floor(
      (baseScrollY + RS.GAME_HEIGHT - y) / RS.CHAR_HEIGHT - 1,
    );
    gridY = RS.clamp(gridY, 0, this.totalRows - 1);

    var gridX;
    if (isRight) {
      var centerEdge = this.rightEdges[gridY] || 200;
      var rCenterStart = this.getRowContentStart(grid[gridY]);
      gridX =
        rCenterStart +
        Math.floor((x - RS.GAME_WIDTH + centerEdge) / RS.CHAR_WIDTH);
    } else {
      var lEdgePx = this.leftEdges[gridY] || 0;
      var lContentPx = this.getRowContentLength(grid[gridY]) * RS.CHAR_WIDTH;
      var lShift = lEdgePx - lContentPx;
      gridX = Math.floor((x - lShift) / RS.CHAR_WIDTH);
    }

    var radiusCells = Math.ceil(radius / RS.CHAR_WIDTH);

    for (var dy = -radiusCells; dy <= radiusCells; dy++) {
      for (var dx = -radiusCells; dx <= radiusCells; dx++) {
        var row = gridY + dy;
        var col = gridX + dx;

        if (
          row >= 0 &&
          row < grid.length &&
          col >= 0 &&
          col < grid[row].length
        ) {
          var cell = grid[row][col];
          if (cell.alive && cell.char !== ' ') {
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radiusCells) {
              cell.alive = false;
              dirtyRows.add(row);
              var screenX;
              if (isRight) {
                var rowEdge = self.rightEdges
                  ? self.rightEdges[row] || 200
                  : 200;
                var rRowStart = self.getRowContentStart(grid[row]);
                screenX =
                  RS.GAME_WIDTH - rowEdge + (col - rRowStart) * RS.CHAR_WIDTH;
              } else {
                var lRowEdge = self.leftEdges ? self.leftEdges[row] || 0 : 0;
                var lRowContentPx =
                  self.getRowContentLength(grid[row]) * RS.CHAR_WIDTH;
                screenX = lRowEdge - lRowContentPx + col * RS.CHAR_WIDTH;
              }
              destroyed.push({
                color: cell.color,
                x: screenX,
                y:
                  RS.GAME_HEIGHT -
                  (row * RS.CHAR_HEIGHT - this.scrollY) -
                  RS.CHAR_HEIGHT,
              });
            }
          }
        }
      }
    }

    this[dirtyFlag] = true;
    return destroyed;
  },
};

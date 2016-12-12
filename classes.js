class Charaster {
  constructor() {
    this.mode = "PENCIL";
    this.clipboard = new Array();
    this.themes = new Array();
    this.theme;
    this.character = "o";
    this.font = "12pt Consolas";
    this.foreground;
    this.background;
    this.bold = false;
    this.italic = false;
    this.fontHeight = 19;
    this.fontWidth = 9;
    this.gridWidth = 80;
    this.gridHeight = 24;
    this.raster = this.createRaster(this.gridWidth, this.gridHeight);
    this.cursor = new Point(0, 0);
    this.prevCursor = new Point(0, 0);

    // Canvases.
    this.gridCanvas;
    this.gridContext;
    this.rasterCanvas;
    this.rasterContext;
    this.cursorCanvas;
    this.cursorContext;

    // Info.
    this.cursorPos;
    this.gridSize;

    // Chrome.
    this.body;
    this.controls;
    this.info;
    this.bars;
    this.foreground;
    this.icons;
    this.iconStrokes;
    this.preview;
    this.noColor;
    this.themeSelect;
  }

  drawGrid() {
    var canvas = this.gridCanvas;
    var context = this.gridContext;
    this.fitToContainer(canvas, context);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = this.theme.grid;
    context.beginPath();
    for (var row = 0; row < canvas.height; row += this.fontHeight) {
      context.moveTo(0, row);
      context.lineTo(canvas.width, row);
      context.stroke();
    }
    for (var col = 0; col < canvas.width; col += this.fontWidth) {
      context.moveTo(col, 0);
      context.lineTo(col, canvas.height);
      context.stroke();
    }
    context.closePath();
  }

  drawRaster() {
    var canvas = this.rasterCanvas;
    var context = this.rasterContext;
    this.fitToContainer(canvas, context);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = this.foreground;
    context.font = "12pt Consolas";
    for (var col = 0; col < raster.length; col++) {
      for (var row = 0; row < raster[0].length; row++) {
        if (raster[col][row] != null) {
          context.fillText(raster[col][row], row * this.fontWidth, col * this.fontHeight - 5);
        }
      }
    }
  }

  drawCursor() {
    var canvas = this.cursorCanvas;
    var context = this.cursorContext;
    this.fitToContainer(canvas, context);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.strokeStyle = this.theme.cursor;
    context.rect(
      this.cursor.x * this.fontWidth, this.cursor.y * this.fontHeight,
      this.fontWidth, this.fontHeight
    );
    context.stroke();
    context.closePath();
    this.cursorPos.innerHTML = "(" + this.cursor.x + ", " + this.cursor.y + ")";
  }

  moveCursorRelative(x, y) {
    this.cursorContext.clearRect(
      this.cursor.x * this.fontWidth, this.cursor.y * this.fontHeight,
      this.fontWidth, -this.fontHeight
    );
    this.cursor.x += x;
    this.cursor.y += y;
    this.drawCursor();
  }

  moveCursor(x, y) {
    this.cursorContext.clearRect(
      this.cursor.x * this.fontWidth, this.cursor.y * this.fontHeight,
      this.fontWidth, -this.fontHeight
    );
    this.cursor.x = x;
    this.cursor.y = y;
    this.drawCursor();
  }

  createRaster(cols, rows) {
    var array = [];
    for (var row = 0; row < rows; row++) {
      array[row] = [];
      for (var col = 0; col < cols; col++) {
        array[row].push(new Cell(new Point(col, row), null));
      }
    }
    return array;
  }

  fitToContainer(canvas, context) {
    canvas.width  = canvas.offsetWidth;
    canvas.width  = this.gridWidth * this.fontWidth + 1;
    canvas.height = canvas.offsetHeight;
    canvas.height = this.gridHeight * this.fontHeight + 1;
    canvas.style.top = controls.clientHeight + 1 + "px";
    context.translate(0.5, 0.5);
  }

  setCell(cell) {
    var context = this.rasterContext;
    context.font = this.font;
    if ((cell.bold == null && this.bold) || (cell.bold)) {
      context.font = "bold " + context.font
    }
    if ((cell.italic == null && this.italic) || (cell.italic)) {
      context.font = "italic " + context.font
    }
    context.clearRect(
      cell.point.x * this.fontWidth, (cell.point.y + 1) * this.fontHeight,
      this.fontWidth, -this.fontHeight
    );
    context.fillStyle = cell.background == null ? this.background : cell.background;
    context.fillRect(
      cell.point.x * this.fontWidth, cell.point.y * this.fontHeight,
      this.fontWidth, this.fontHeight
    );
    if (cell.character != null) {
      context.fillStyle = cell.foreground == null ? this.foreground : cell.foreground;
      context.fillText(
        cell.character,
        cell.point.x * this.fontWidth, (cell.point.y + 1) * this.fontHeight - 5
      );
    }
    this.raster[cell.point.y][cell.point.x] = cell;
  }

  getCell(point) {
    return this.raster[this.cursor.y][this.cursor.x];
  }

  applyTheme(name) {

    // Set the colors of the page.
    this.body.style.background = this.theme.background;
    this.controls.style.background = this.theme.bar;
    this.controls.style.borderColor = this.theme.barBorder;
    this.info.style.background = this.theme.bar;
    this.info.style.borderColor = this.theme.barBorder;
    this.preview.style.borderColor = this.theme.barBorder;
    this.noColor.style.borderColor = this.theme.barBorder;
    this.themeSelect.style.borderColor = this.theme.barBorder;
    for (var i = 0; i < this.icons.length; i++) {
      this.icons[i].style.fill = this.theme.icon;
    }
    for (var i = 0; i < this.iconStrokes.length; i++) {
      this.iconStrokes[i].style.stroke = this.theme.icon;
    }
    for (var i = 0; i < this.bars.length; i++) {
      this.bars[i].style.borderColor = this.theme.barBorder;
    }

    // Set character colors.
    if (this.foreground == null) {
      this.foreground = this.theme.foreground;
    }
    if (this.background == null) {
      this.background = this.theme.background;
    }
    this.preview.style.color = this.foreground;
    this.preview.style.backgroundColor = this.background;
  }

  coordToGrid(point) {
    var grid = new Point(
      Math.floor(point.x / this.fontWidth) - 1,
      Math.floor(point.y / this.fontHeight) - 1
    );
    grid.x = Math.min(grid.x, this.gridWidth - 1);
    grid.x = Math.max(grid.x, 0);
    grid.y = Math.min(grid.y, this.gridHeight - 1);
    grid.y = Math.max(grid.y, 0);
    if (isNaN(grid.x)) {
      grid.x = this.gridWidth - 1;
    }
    if (isNaN(grid.y)) {
      grid.y = this.gridHeight - 1;
    }
    return grid;
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Cell {
  constructor(point, character, foreground, background, bold, italic) {
    this.point = point;
    this.character = character;
    this.foreground = foreground;
    this.background = background;
    this.bold = bold;
    this.italic = italic;
  }
  equality(other) {
    if (this.point == other.point && this.character == other.character) {
      return true;
    }
    return false;
  }
}

class Theme {
  constructor(name, foreground, background, grid, cursor, bar, barBorder, icon, iconActive, iconActiveText, colors) {
    this.name = name;
    this.foreground = foreground;
    this.background = background;
    this.grid = grid;
    this.cursor = cursor;
    this.bar = bar;
    this.barBorder = barBorder;
    this.icon = icon;
    this.iconActive = iconActive;
    this.iconActiveText = iconActiveText;
    this.colors = colors;
  }
}

// typerEngine.js
class TyperEngine {
  constructor({ container, cols = 30, rows = 30 }) {
    this.container = container;
    this.cols = cols;
    this.rows = rows;

    this.lines = [this._makeEmptyLine()];
    this.cursor = { row: 0, col: 0 };

    this._render();
    window.addEventListener('keydown', (e) => this._onKey(e));
  }

  _makeEmptyLine() { return []; }

  _onKey(e) {
    const key = e.key;

    if (key === 'Enter')     { e.preventDefault(); this._newline();   return; }
    if (key === 'Backspace') { e.preventDefault(); this._backspace(); return; }
    if (key === ' ')         { e.preventDefault(); this._space();     return; }

    if (key.length > 1) return;

    const ch = key.toLowerCase();
    const mapping = LETTER_TO_BIOME[ch];
    if (!mapping) return;

    const glyphs = mapping.glyphs;
    const char = glyphs[Math.floor(Math.random() * glyphs.length)];
    const biome = mapping.biome;

    const classes = this._classesForBiome(biome);
    this._typeCell({ char, className: classes });
  }

  _classesForBiome(biome) {
    const list = [biome];
    if (LAND_BIOMES.has(biome)) list.push('tile'); // padded background
    return list.join(' ');
  }

  _typeCell(cell) {
    if (this.cursor.col >= this.cols) this._newline();

    const line = this.lines[this.cursor.row];
    line.splice(this.cursor.col, 0, cell);
    if (line.length > this.cols) line.length = this.cols;
    this.cursor.col++;

    this._render();
  }

  _space() {
    if (this.cursor.col >= this.cols) this._newline();
    const line = this.lines[this.cursor.row];
    line.splice(this.cursor.col, 0, { char: ' ', className: '' });
    if (line.length > this.cols) line.length = this.cols;
    this.cursor.col++;
    this._render();
  }

  _newline() {
    this.lines.splice(this.cursor.row + 1, 0, this._makeEmptyLine());
    this.cursor.row++;
    this.cursor.col = 0;

    if (this.lines.length > this.rows) {
      this.lines.shift();
      this.cursor.row = Math.max(0, this.cursor.row - 1);
    }
    this._render();
  }

  _backspace() {
    if (this.cursor.col > 0) {
      const line = this.lines[this.cursor.row];
      line.splice(this.cursor.col - 1, 1);
      this.cursor.col--;
      this._render();
      return;
    }
    if (this.cursor.row > 0) {
      const prevLen = this.lines[this.cursor.row - 1].length;
      this.lines.splice(this.cursor.row, 1);
      this.cursor.row--;
      this.cursor.col = Math.min(prevLen, this.cols);
      this._render();
    }
  }

  _render() {
    const frag = document.createDocumentFragment();

    for (let r = 0; r < this.lines.length; r++) {
      const p = document.createElement('p');
      const line = this.lines[r];

      for (let c = 0; c < Math.min(line.length, this.cols); c++) {
        const span = document.createElement('span');
        span.className = line[c].className || 'unknown';
        span.textContent = line[c].char;
        p.appendChild(span);
      }

      if (r === this.cursor.row) {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = ' ';
        p.appendChild(cursor);
      }

      frag.appendChild(p);
    }

    while (frag.childNodes.length > this.rows) frag.removeChild(frag.firstChild);

    this.container.innerHTML = '';
    this.container.appendChild(frag);
  }
}

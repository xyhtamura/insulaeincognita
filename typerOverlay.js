// TyperOverlay: paints a transparent, grid-aligned layer on top of the terrain.
// IMPORTANT: never writes to or reads from the generator’s memory.
// Cursor stays on a fixed visual row; typed chars live only in the overlay DOM.

class TyperOverlay {
  constructor({ container, fixedRowFromTop = 12, cols = 30, rows = 30 }) {
    this.container = container;
    this.cols = cols;
    this.rows = rows;

    // keep as many <p> lines as terrain (index_combined syncs these)
    this.lines = []; // array of arrays of {char, className}
    this.cursor = { row: fixedRowFromTop, col: 0 };
    this.fixedRowFromTop = fixedRowFromTop;

    // allow focusing for keystrokes
    this.container.addEventListener('click', () => this.container.focus());
    window.addEventListener('keydown', (e) => this._onKey(e));

    this._render();
  }

  // called by index to keep count aligned
  onSync(terrainLineCount) {
    while (this.lines.length < terrainLineCount) {
      this.lines.unshift([]); // new terrain prepends; we mirror with an empty line at top
    }
    while (this.lines.length > terrainLineCount) {
      this.lines.pop();
    }
    // clamp cursor row if needed
    if (this.fixedRowFromTop > this.lines.length - 1) {
      this.fixedRowFromTop = Math.max(0, this.lines.length - 1);
    }
    this.cursor.row = this.fixedRowFromTop;
    // re-render to keep cursor visible
    this._render();
  }

  _onKey(e) {
    // we only care about a–z, space, backspace
    if (e.key === 'Backspace') { e.preventDefault(); this._backspace(); return; }
    if (e.key === ' ') { e.preventDefault(); this._typeFromMapping('h'); return; } // space = plain
    if (e.key === 'Enter') { e.preventDefault(); this.cursor.col = 0; this._render(); return; }

    if (e.key.length === 1) {
      const ch = e.key.toLowerCase();
      if (LETTER_TO_BIOME[ch]) { this._typeFromMapping(ch); }
    }
  }

  _typeFromMapping(letter) {
    const mapping = LETTER_TO_BIOME[letter];
    const glyph = mapping.glyphs[Math.floor(Math.random() * mapping.glyphs.length)];
    const cls = BIOME_CLASS_MAP[mapping.biome] || 'unknown';
    this._typeCell({ char: glyph, className: cls });
  }

  _typeCell(cell) {
    // fixed row; advance column; overwrite mode after COLS
    const rowArr = this._getRowArray(this.cursor.row);

    rowArr[this.cursor.col] = cell;
    this.cursor.col = (this.cursor.col + 1) % this.cols;

    this._render();
  }

  _backspace() {
    const rowArr = this._getRowArray(this.cursor.row);
    this.cursor.col = (this.cursor.col - 1 + this.cols) % this.cols;
    rowArr[this.cursor.col] = undefined; // clear
    this._render();
  }

  _getRowArray(r) {
    while (this.lines.length === 0) this.lines.push([]);
    if (!this.lines[r]) this.lines[r] = [];
    return this.lines[r];
  }

  _render() {
    const frag = document.createDocumentFragment();
    const lineCount = this.lines.length;

    for (let r = 0; r < lineCount; r++) {
      const p = document.createElement('p');
      const arr = this.lines[r] || [];

      for (let c = 0; c < this.cols; c++) {
        const cell = arr[c];
        if (cell) {
          const span = document.createElement('span');
          span.className = cell.className;
          span.textContent = cell.char;
          p.appendChild(span);
        } else {
          // maintain grid spacing with invisible placeholders
          const span = document.createElement('span');
          span.textContent = ' ';
          p.appendChild(span);
        }
      }

      // draw the cursor on the fixed row
      if (r === this.fixedRowFromTop) {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = ' ';
        p.appendChild(cursor);
      }

      frag.appendChild(p);
    }

    this.container.innerHTML = '';
    this.container.appendChild(frag);
  }
}

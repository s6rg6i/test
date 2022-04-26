"use strict";
const settings = {
  rowsCount: 21,
  colsCount: 21,
  speed: 2,
  winFoodCount: 50,
};

const config = {
  settings,

  init(userSettings) {
    Object.assign(this.settings, userSettings);
    // const currentSettings = this.settings;
    // this.settings = { currentSettings, ...userSettings};
  },

  getRowsCount() {
    return this.settings.rowsCount;
  },

  getColsCount() {
    return this.settings.colsCount;
  },

  getSpeed() {
    return this.settings.speed;
  },

  getWinFoodCount() {
    return this.settings.winFoodCount;
  },

  validate() {
    const result = {
      isValid: true,
      errors: [],
    };

    if (this.getRowsCount() < 10 || this.getRowsCount() > 30) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение rowsCount должно быть в диапазоне [10, 30].');
    }

    if (this.getColsCount() < 10 || this.getColsCount() > 30) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение colsCount должно быть в диапазоне [10, 30].');
    }

    if (this.getSpeed() < 1 || this.getSpeed() > 10) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение speed должно быть в диапазоне [1, 10].');
    }

    if (this.getWinFoodCount() < 5 || this.getWinFoodCount() > 50) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение winFoodCount должно быть в диапазоне [5, 50].');
    }

    return result;
  },
};

const map = {
  cells: {},
  usedCells: [],

  init(rowsCount, colsCount) {
    const table = document.getElementById('game');
    table.innerHTML = '';

    this.cells = {};
    this.usedCells = [];

    for (let row = 0; row < rowsCount; row++) {
      const tr = document.createElement('tr');
      tr.classList.add('row');
      table.appendChild(tr);

      for (let col = 0; col < colsCount; col++) {
        const td = document.createElement('td');
        const mapKey = `x${col}_y${row}`;

        td.classList.add('cell');
        tr.appendChild(td);

        this.cells[mapKey] = td;
      }
    }
  },

  render(snakePointsArray, foodPoint) {
    for (const cell of this.usedCells) {
      cell.className = 'cell';
    }

    this.usedCells = [];

    const foodPintCellKey = `x${foodPoint.x}_y${foodPoint.y}`;
    const foodCell = this.cells[foodPintCellKey];
    foodCell.classList.add('food');
    this.usedCells.push(foodCell);

    snakePointsArray.forEach((point, index) => {
      const snakePointCellKey = `x${point.x}_y${point.y}`;
      const snakeCell = this.cells[snakePointCellKey];
      const snakeCellClass = index === 0 ? 'snakeHead' : 'snakeBody';

      snakeCell.classList.add(snakeCellClass);
      this.usedCells.push(snakeCell);
    });
  },
};

const snake = {
  body: [],
  direction: null,
  lastStepDirection: null,

  init(startBody, direction) {
    this.body = startBody;
    this.direction = direction;
    this.lastStepDirection = direction;
  },

  getBody() {
    return this.body;
  },

  getLastStepDirection() {
    return this.lastStepDirection;
  },

  setDirection(direction) {
    this.direction = direction;
  },

  isOnPoint(point) {
    return this.getBody().some(snakePoint => snakePoint.x === point.x && snakePoint.y === point.y);
  },

  makeStep() {
    this.lastStepDirection = this.direction;
    this.getBody().unshift(this.getNextStepHeadPoint());
    this.getBody().pop();
  },

  growUp() {
    const lastBodyIdx = this.getBody().length - 1;
    const lastBodyPoint = this.getBody()[lastBodyIdx];
    const lastBodyPointClone = Object.assign({}, lastBodyPoint);

    this.getBody().push(lastBodyPointClone);
  },

  getNextStepHeadPoint() {
    const headPoint = this.getBody()[0];

    switch(this.direction) {
      case 'up':
        return {x: headPoint.x, y: headPoint.y - 1};
      case 'right':
        return {x: headPoint.x + 1, y: headPoint.y};
      case 'down':
        return {x: headPoint.x, y: headPoint.y + 1};
      case 'left':
        return {x: headPoint.x - 1, y: headPoint.y};
    }
  },
};

const food = {
  x: null,
  y: null,

  getCoordinates() {
    return {
      x: this.x,
      y: this.y,
    };
  },

  setCoordinates(point) {
    this.x = point.x;
    this.y = point.y;
  },

  isOnPoint(point) {
    return this.x === point.x && this.y === point.y;
  },
};

const status = {
  condition: null,

  setPlaying() {
    this.condition = 'playing';
  },

  setStopped() {
    this.condition = 'stopped';
  },

  setFinished() {
    this.condition = 'finished';
  },

  isPlaying() {
    return this.condition === 'playing';
  },

  isStopped() {
    return this.condition === 'stopped';
  },
};

const game = {
  config,
  map,
  snake,
  food,
  status,
  tickInterval: null,

  init(userSettings = {}) {
    this.config.init(userSettings);
    const validation = this.config.validate();

    if (!validation.isValid) {
      for (const err of validation.errors) {
        console.error(err);
      }
      return;
    }

    this.map.init(this.config.getRowsCount(), this.config.getColsCount());

    this.setEventHandlers();
    this.reset();
  },

  setEventHandlers() {
    document
        .getElementById('playButton')
        .addEventListener('click', this.playClickHandler.bind(this));
    document
        .getElementById('newGameButton')
        .addEventListener('click', this.reset.bind(this));

    document.addEventListener('keydown', this.keyDownHandler.bind(this));
  },

  playClickHandler() {
    if (this.status.isPlaying()) this.stop();
    else if (this.status.isStopped()) this.play();
  },

  keyDownHandler(event) {
    if (!this.status.isPlaying()) return;

    const direction = this.getDirectionByCode(event.code);
    
    if (this.canSetDirection(direction)) this.snake.setDirection(direction);
  },

  getDirectionByCode(code) {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        return 'up';
      case 'KeyD':
      case 'ArrowRight':
        return 'right';
      case 'KeyS':
      case 'ArrowDown':
        return 'down';
      case 'KeyA':
      case 'ArrowLeft':
        return 'left';
    }
  },

  canSetDirection(direction) {
    const lastStepDirection = this.snake.getLastStepDirection();

    return direction === 'up' && lastStepDirection !== 'down' ||
        direction === 'right' && lastStepDirection !== 'left' ||
        direction === 'down' && lastStepDirection !== 'up' ||
        direction === 'left' && lastStepDirection !== 'right';
  },

  reset() {
    this.stop();
    this.snake.init(this.getStartSnakeBody(), 'up');
    this.food.setCoordinates(this.getRandomFreeCoordinates());
    this.render();
  },

  getStartSnakeBody() {
    return [
      {
        x: Math.floor(this.config.getColsCount() / 2),
        y: Math.floor(this.config.getRowsCount() / 2),
      }
    ];
  },

  getRandomFreeCoordinates() {
    const exclude = [this.food.getCoordinates(), ...this.snake.getBody()];

    while (true) {
      const rndPoint = {
        x: Math.floor(Math.random() * this.config.getColsCount()),
        y: Math.floor(Math.random() * this.config.getRowsCount()),
      };

      if (!exclude.some(exPoint => rndPoint.x === exPoint.x && rndPoint.y === exPoint.y)) return rndPoint;
    }
  },

  play() {
    this.status.setPlaying();
    this.tickInterval = setInterval(this.tickHandler.bind(this), 1000 / this.config.getSpeed());
    this.setPlayButton('Стоп');
  },

  stop() {
    this.status.setStopped();
    clearInterval(this.tickInterval);
    this.setPlayButton('Старт');
  },

  finish() {
    this.status.setFinished();
    clearInterval(this.tickInterval);
    this.setPlayButton('Игра завершена', true);
  },

  setPlayButton(text, isDisabled = false) {
    const playButton = document.getElementById('playButton');

    playButton.textContent = text;

    isDisabled
        ? playButton.classList.add('disabled')
        : playButton.classList.remove('disabled');
  },

  tickHandler() {
    if (!this.canMakeStep()) return this.finish();

    if (this.food.isOnPoint(this.snake.getNextStepHeadPoint())) {
      this.snake.growUp();
      this.food.setCoordinates(this.getRandomFreeCoordinates());

      if (this.isGameWon()) this.finish();
    }

    this.snake.makeStep();
    this.render();
  },

  canMakeStep() {
    const nextHeadPoint = this.snake.getNextStepHeadPoint();

    return !this.snake.isOnPoint(nextHeadPoint) &&
        nextHeadPoint.x < this.config.getColsCount() &&
        nextHeadPoint.y < this.config.getRowsCount() &&
        nextHeadPoint.x >= 0 &&
        nextHeadPoint.y >= 0;
  },

  isGameWon() {
    return this.snake.getBody().length > this.config.getWinFoodCount();
  },

  render() {
    this.map.render(this.snake.getBody(), this.food.getCoordinates());
  },
};

game.init({ speed: 5 });
/// xxx000xxx
/// xxxx000xx

/// xxx000xxx
/// xxx0000xx
/// xxxx0000x

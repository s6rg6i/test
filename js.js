"use strict";
const settings = {
    rowsCount: 21,
    colsCount: 30,
    speed: 2,
    winFoodCount: 50,
};

/** Объект config {settings} **/
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

/** Объект map {cells: {x0_y0:td.cell...}, usedCells: [td.cell.food,td.cell.snakeHead],}**/
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

    render(snakePointsArray, foodPoint, obstaclePoints) {
        for (const cell of this.usedCells) {
            cell.className = 'cell';
        }

        this.usedCells = [];

        const foodPointCellKey = `x${foodPoint.x}_y${foodPoint.y}`;
        const foodCell = this.cells[foodPointCellKey];
        foodCell.classList.add('food');
        this.usedCells.push(foodCell);

        obstaclePoints.forEach((point) => {
            const obstaclePointCellKey = `x${point.x}_y${point.y}`;
            const obstacleCell = this.cells[obstaclePointCellKey];
            obstacleCell.classList.add('obstacle');
            this.usedCells.push(obstacleCell);
        });

        snakePointsArray.forEach((point, index) => {
            const snakePointCellKey = `x${point.x}_y${point.y}`;
            const snakeCell = this.cells[snakePointCellKey];
            const snakeCellClass = index === 0 ? 'snakeHead' : 'snakeBody';

            snakeCell.classList.add(snakeCellClass);
            this.usedCells.push(snakeCell);
        });
    },
};

/** Объект snake {body: [], direction, lastStepDirection}**/
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

    makeStep(max_x, max_y) {
        this.lastStepDirection = this.direction;
        this.getBody().unshift(this.getNextStepHeadPoint(max_x, max_y));
        this.getBody().pop();
    },

    growUp() {
        const lastBodyIdx = this.getBody().length - 1;
        const lastBodyPoint = this.getBody()[lastBodyIdx];
        const lastBodyPointClone = Object.assign({}, lastBodyPoint);

        this.getBody().push(lastBodyPointClone);
    },

    getNextStepHeadPoint(max_x, max_y) {
        let x0 = this.getBody()[0].x;
        let y0 = this.getBody()[0].y;
        switch(this.direction) {
            case 'up':
                return {x: x0, y: (y0 - 1 < 0) ? max_y - 1 : y0 - 1 };
            case 'right':
                return {x: x0 + 1 >= max_x ? 0 : x0 + 1, y: y0};
            case 'down':
                return {x: x0, y: y0 + 1 >= max_y ? 0 : y0 + 1 };
            case 'left':
                return {x: x0 - 1 < 0 ? max_x - 1 : x0 - 1, y: y0};
        }
    },
};

/** Объект obstacle {x:0,y:0}**/
const obstacle = {
    locs: [],

    init() {
        this.locs = [];
    },

    getLocs() {
        return this.locs;
    },

    isOnPoint(point) {
        return this.getLocs().some(obstaclePoint => obstaclePoint.x === point.x && obstaclePoint.y === point.y);
    },

};

/** Объект food {x:0,y:0}**/
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

/** Объект status {condition: 'playing' || 'stopped' || 'finished' }**/
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

/** Объект game { config, map, snake, food, status, tickInterval }**/
const game = {
    config,
    map,
    snake,
    food,
    obstacle,
    status,
    tickInterval: null,
    score: 0,
    block_score : null,

    init(userSettings = {}) {
        this.config.init(userSettings);
        const validation = this.config.validate();

        if (!validation.isValid) {
            for (const err of validation.errors) {
                console.error(err);
            }
            return;
        }
        this.block_score = document.querySelector("#score");
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
        this.obstacle.init()
        this.score = 0
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
        const exclude = [this.food.getCoordinates(), ...this.snake.getBody(), ...this.obstacle.getLocs()];

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

        if (this.food.isOnPoint(
            this.snake.getNextStepHeadPoint(this.config.getColsCount(),this.config.getRowsCount()))) {

            this.snake.growUp();
            this.food.setCoordinates(this.getRandomFreeCoordinates());

            this.obstacle.getLocs().push(this.getRandomFreeCoordinates())
            this.block_score.innerText = (++this.score).toString().padStart(2, "0");
            if (this.isGameWon()) this.finish();
        }

        this.snake.makeStep(this.config.getColsCount(),this.config.getRowsCount());
        this.render();
    },

    canMakeStep() {
        let point = this.snake.getNextStepHeadPoint(this.config.getColsCount(),this.config.getRowsCount())
        return !this.snake.isOnPoint(point) && !this.obstacle.isOnPoint(point)
    },

    isGameWon() {
        return this.snake.getBody().length > this.config.getWinFoodCount();
    },

    render() {
        this.map.render(this.snake.getBody(), this.food.getCoordinates(), this.obstacle.getLocs());
        this.block_score.innerText = this.score.toString().padStart(2, "0");
    },
};

// map.init(30,30);
// map.render([{x:5,y:5},{x:5,y:6},{x:5,y:7}],{x:1,y:1}, [{x:10,y:10}, {x:12,y:12}])

game.init({ speed: 5 });

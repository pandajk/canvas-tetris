import Game from "./game";

type MatrixData = 0 | 1;
type TetrisMatrix = MatrixData[][];
type RotateDirection = 0 | 1 | 2 | -1 | -2;
type TetrisShape = {
  matrix: TetrisMatrix;
};
type StageTetrisShape = TetrisShape & {
  position: {
    x: number;
    y: number;
  };
  offset: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
};
class Tetris extends Game {
  tower: TetrisMatrix = [];
  shapes: TetrisShape[] = [];
  stageShape: StageTetrisShape | null = null;
  frames: IntRange<10, 61> = 10; // 10-60,  1000ms/frames
  subscriber: Function = () => {};
  private moveStep = 1;
  private score: number = 0;
  public getScore(): number {
    return this.score;
  }
  constructor(props: any) {
    super(props);
  }

  private initShapes() {
    if (!this.shapes) return;

    // 7种类型
    /**
     * 1
     * |
     * |
     * |
     * |
     * */
    this.shapes.push({
      matrix: [
        [1, 0],
        [1, 0],
        [1, 0],
        [1, 0],
      ],
    });
    /**
     * 2
     * |
     * |-
     *  |
     *
     * */
    this.shapes.push({
      matrix: [
        [1, 0],
        [1, 1],
        [0, 1],
        // [0, 0],
      ],
    });
    /**
     * 3
     *  |
     * -|
     * |
     *
     * */
    this.shapes.push({
      matrix: [
        [0, 1],
        [1, 1],
        [1, 0],
        // [0, 0],
      ],
    });
    /**
     * 4
     * ||
     * ||
     *
     *
     * */
    this.shapes.push({
      matrix: [
        [1, 1],
        [1, 1],
        // [0, 0],
        // [0, 0],
      ],
    });
    /**
     * 5
     * |
     * |-
     * |
     *
     * */
    this.shapes.push({
      matrix: [
        [1, 0],
        [1, 1],
        [1, 0],
        // [0, 0],
      ],
    });
    /**
     * 6
     * --
     * |
     * |
     *
     */
    this.shapes.push({
      matrix: [
        [1, 1],
        [1, 0],
        [1, 0],
        // [0, 0],
      ],
    });
    /**
     * 7
     * --
     *  |
     *  |
     *
     */
    this.shapes.push({
      matrix: [
        [1, 1],
        [0, 1],
        [0, 1],
        // [0, 0],
      ],
    });
  }
  private initTower() {
    // const {
    //   grids: [x],
    // } = this.scene;

    this.tower = [
      //   new Array(x).fill([0, 1]).map((_, i) => (i % 2) as MatrixData),
      //   new Array(x).fill([0, 1]).map((_, i) => (i % 3) as MatrixData),
      //   new Array(x).fill([0, 1]).map((_, i) => (i % 5) as MatrixData),
      //   new Array(x).fill([0, 1]).map((_, i) => (i % 5) as MatrixData),
      //   new Array(x).fill([0, 1]).map((_, i) => (i % 5) as MatrixData),
    ];
  }

  private renderBackground() {
    const { ctx } = this;
    const {
      background,
      //   width,
      //   height,
      gridSize = 0,
      grids: [gridX, gridY],
    } = this.scene;
    this.ctx.fillStyle = background.color;

    const width = gridSize * gridX;
    const height = gridSize * gridY;
    this.ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    // horizontal
    for (let i = 0; i <= gridX; i++) {
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, height);
      if (i < gridX) {
        ctx.fillText(i.toString(), i * gridSize + gridSize / 4, gridSize / 2);
      }
    }
    // vertical
    for (let i = 0; i <= gridY; i++) {
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(width, i * gridSize);
      if (i < gridY) {
        ctx.fillText(i.toString(), 4, i * gridSize + gridSize / 2);
      }
    }
    ctx.stroke();
  }
  private renderTower() {
    const {
      ctx,
      scene: {
        gridSize = 0,
        grids: [, y],
      },
    } = this;

    ctx.fillStyle = "#fff";

    this.tower.forEach((row, i) => {
      row.forEach((show, j) => {
        if (show) {
          ctx.fillRect(
            j * gridSize,
            (y - 1 - i) * gridSize,
            gridSize,
            gridSize
          );
        }
      });
    });
  }
  private createShape(): StageTetrisShape {
    const {
      grids: [x],
    } = this.scene;
    const randomShape = Math.floor(Math.random() * this.shapes.length);

    const shape = JSON.parse(
      JSON.stringify(this.shapes.slice(randomShape, randomShape + 1)[0])
    ) as StageTetrisShape;

    const direction = Math.round(Math.random() * 4 - 2) as RotateDirection;

    const rotateActions = [
      this.rotateMatrixRight,
      undefined,
      this.rotateMatrixLeft,
    ];
    const action = rotateActions[Math.sign(direction) + 1];
    let matrix = shape.matrix;
    if (action) {
      new Array(Math.abs(direction)).fill(0).forEach(() => {
        matrix = action.call(this, matrix) as TetrisMatrix;
      });
    } else {
      matrix = this.fillMatrix(matrix);
    }
    shape.matrix = matrix;

    const offset = this.getShapeMatrixOffset(matrix);

    shape.position = {
      x: Math.round(
        x / 2 - 2 - (matrix.length - offset.left - offset.right) / 2
      ),
      y: 0,
    };

    shape.offset = offset;

    return shape;
  }

  getShapeMatrixOffset(matrix: TetrisMatrix) {
    const getOffset = (newMatrix: TetrisMatrix) => {
      const sum = newMatrix.map((row) => {
        return row.reduce((prev: number, cur: number) => {
          return prev + cur;
        }, 0);
      });
      let front: number | null = null;
      let back: number = 0;
      sum.forEach((rst) => {
        if (rst && front === null) {
          front = 0;
        }
        if (!rst && front !== 0) {
          front = front ? front + 1 : 1;
        }

        if (!rst) {
          back += 1;
        } else {
          back = 0;
        }
      });
      return [front || 0, back];
    };

    const [top, bottom] = getOffset(matrix);
    const [left, right] = getOffset(this.rotateMatrixLeft(matrix));

    return { top, bottom, left, right };
  }

  private renderShape(shape: StageTetrisShape) {
    const {
      ctx,
      scene: { gridSize = 0 },
    } = this;
    const { matrix, position } = shape;
    const { x, y } = position!;
    // ctx.beginPath();
    // ctx.fillStyle = "red";
    // ctx.fillRect(2 * gridSize, 1 * gridSize, +1 * gridSize, (0 + 1) * gridSize);
    ctx.fillStyle = "#fff";

    matrix.forEach((row, i) => {
      row?.forEach((show, j) => {
        if (show) {
          // ctx.moveTo((x+j)*gridSize, (y+i)*gridSize)
          ctx.fillRect(
            (x + j) * gridSize,
            (y + i) * gridSize,
            gridSize,
            gridSize
          );
        }
      });
    });
  }
  public onSceneLoading(): void {
    const {
      scene: {
        width,
        height,
        grids: [x, y],
      },
    } = this;
    this.scene.gridSize = Math.floor(Math.min(width / x, height / y) / 2) * 2;
    this.initShapes();
    this.initTower();
  }
  public onSceneRender(): void {
    this.renderBackground();
    this.renderTower();
  }
  public onGameSuspend(): void {}
  public onStageLoading(): void {
    const shape = this.createShape();
    this.stageShape = shape;
  }
  public onStageRender(): void {
    if (!this.ctx || !this.scene || !this.stageShape) return;

    if (this.status === "start") {
      this.renderShape(this.stageShape);
    }
  }

  public onGameReady(): void {
    // this.gameStart();
    this.subscriber("onGameReady", { score: 1 });
  }

  public onGameStart(): void {
    this.onStageRender();
    requestAnimationFrame(this.onProcessing.bind(this));
  }
  private onProcessing(time: any) {
    if (this.status !== "start") return;
    if (!this.stageShape) {
      requestAnimationFrame(this.onProcessing.bind(this));
      return;
    }
    if (this.stageShape.position.y > this.scene.grids[1]) {
      console.log("out", this.stageShape.position.y, this.scene.grids[1]);

      return;
    }

    //
    if (
      time - this.frameFlashAt > 1000 / this.frames &&
      !this.isRenderProcessing
    ) {
      this.isRenderProcessing = true;
      this.frameFlashAt = time;
      const isTouched = !this.boundaryDetect();
      // 掉落方块与堆积塔接触
      if (isTouched) {
        // 合并数据
        this.mergeMatrix();
        // 计算
        this.accountingResult();
        this.stageShape = null;
        this.onStageLoading();
      } else {
        this.stageShape.position.y += this.moveStep;
      }
      this.resetStage();
      this.isRenderProcessing = false;
    }

    requestAnimationFrame(this.onProcessing.bind(this));
  }

  private accountingResult() {
    if (this.tower.length >= this.scene.grids[1]) {
      this.gameOver();
      return;
    }
    const result: number[] = [];
    this.tower.forEach((row, index) => {
      if (!row.some((val) => !val)) {
        result.push(index);
      }
    });
    this.onAccountedResult(result);
  }

  private onAccountedResult(result: number[]) {
    console.log("onAccountedResult", result);
    if (result.length > 0) {
      if (result.length >= 4) {
        this.score += 500;
      } else {
        this.score += result.length * 100;
      }
      this.tower = this.tower
        .map((row) => {
          return row.every((val) => val) ? undefined : row;
        })
        .filter((row) => row) as TetrisMatrix;

      this.subscriber("onAccountedResult", { score: this.score });
    }
  }

  private rotateMatrixLeft(res: TetrisMatrix) {
    const matrix = this.fillMatrix(res) as TetrisMatrix;
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n - 1 - i; j++) {
        try {
          [
            matrix[i][j],
            matrix[j][n - 1 - i],
            matrix[n - 1 - i][n - 1 - j],
            matrix[n - 1 - j][i],
          ] = [
            matrix[n - 1 - j][i],
            matrix[i][j],
            matrix[j][n - 1 - i],
            matrix[n - 1 - i][n - 1 - j],
          ];
        } catch (error) {}
      }
    }

    return this.trimMatrix(matrix);
  }
  private rotateMatrixRight(res: TetrisMatrix) {
    const matrix = this.fillMatrix(res) as TetrisMatrix;
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
      for (let j = i; j < n - 1 - i; j++) {
        [
          matrix[n - 1 - j][i],
          matrix[n - 1 - i][n - 1 - j],
          matrix[j][n - 1 - i],
          matrix[i][j],
        ] = [
          matrix[i][j],
          matrix[n - 1 - j][i],
          matrix[n - 1 - i][n - 1 - j],
          matrix[j][n - 1 - i],
        ];
      }
    }

    return this.trimMatrix(matrix);
  }
  private fillMatrix(matrix: any[]) {
    let max: number = matrix.length;
    const fill = [
      ...matrix.map((row: []) => {
        max = Math.max(row?.length, max);

        return [...row, ...new Array(max - row.length).fill(0)];
      }),
      ...new Array(max - matrix.length).fill(new Array(max).fill(0)),
    ];

    return fill;
  }
  private trimMatrix(matrix: TetrisMatrix) {
    return [
      ...matrix
        .map((row) => {
          return [...row!];
          // const rst = row.reduce((prev: number, curr = 0) => {
          //   return prev + curr;
          // }, 0);

          // if (rst) return [...row];
          // return undefined;
        })
        .filter((el) => el),
    ];
  }
  private onHandleRotateLeft() {
    if (!this.stageShape) return;
    const { matrix } = this.stageShape;
    this.stageShape.matrix = this.rotateMatrixLeft(matrix) as TetrisMatrix;

    this.stageShape.offset = this.getShapeMatrixOffset(this.stageShape.matrix);

    this.onStageRender();
  }
  private onHandleRotateRight() {
    if (!this.stageShape) return;
    const { matrix } = this.stageShape;
    this.stageShape.matrix = this.rotateMatrixRight(matrix) as TetrisMatrix;
    const offset = this.getShapeMatrixOffset(this.stageShape.matrix);
    console.log("offset", offset);

    this.stageShape.offset = offset;
    this.onStageRender();
  }

  private onHandleDown() {
    if (!this.stageShape?.position) return;
    if (!this.boundaryDetect()) {
      this.mergeMatrix();
      this.stageShape = null;
      // this.getNextShape();
      return;
    }
    this.stageShape.position.y += this.moveStep;
    this.onStageRender();
  }
  private onHandleLeft() {
    if (!this.stageShape?.position) return;
    const { position, offset } = this.stageShape;
    if (position.x + (offset?.left || 0) <= 0) return;
    this.stageShape.position.x -= this.moveStep;
    this.onStageRender();
  }
  private onHandleRight() {
    if (!this.stageShape?.position) return;
    const { position, offset, matrix } = this.stageShape;
    if (
      position.x + matrix.length - (offset?.right || 0) >=
      this.scene.grids[0]
    )
      return;
    this.stageShape.position.x += this.moveStep;
    this.onStageRender();
  }

  private boundaryDetect() {
    if (!this.stageShape?.position) return false;

    const {
      stageShape: {
        matrix: shapeMatrix,
        position: { x, y },
        offset: { top, bottom },
      },
      scene: {
        grids: [, gridY],
      },
      tower,
    } = this;
    const shapeMatrixValidLength = shapeMatrix.length - top - bottom;
    // shape 不能超出屏幕
    if (shapeMatrixValidLength + y >= gridY) return false;
    // shape 和 tower 还没有相遇
    // console.log(shapeMatrix.length, tower.length, y, gridY);

    if (shapeMatrixValidLength + tower.length + y < gridY) return true;

    let canMerge = true;

    // 检测指定的一行是否可以合并，shapeRow 和 towerRow
    function _checkRowMergeable(row: any, towerRow: any) {
      let mergeable = true;
      for (let k = 0; k < row.length; k++) {
        // 都存在值
        if (row[k] && towerRow[k + x]) {
          mergeable = false;
          break;
        }
      }
      return mergeable;
    }

    // 重叠的行
    const overlapRow = shapeMatrixValidLength + tower.length + y - gridY + 1;
    console.log("overlapRow", overlapRow);

    // 需要检查的行数
    let j = Math.min(overlapRow, shapeMatrixValidLength);

    // 检测重叠的行是否可以合并
    while (j--) {
      if (!canMerge) break;

      // TODO：使用堆栈实现 tower
      // 先进后出，检测，
      const stageMatrixRow = shapeMatrix[shapeMatrixValidLength - 1 - j];
      const towerRow = tower[tower.length - overlapRow + j];
      if (towerRow) {
        canMerge = _checkRowMergeable(stageMatrixRow, towerRow);
      }
    }

    return canMerge;
  }
  private mergeMatrix() {
    if (!this.stageShape?.position) return;
    const {
      stageShape: {
        matrix,
        position: { x, y },
      },
      tower,
      scene: {
        grids: [gridX, gridY],
      },
    } = this;

    let resultLength = gridY - y; // 最终 tower 矩阵的长度
    let startRow = resultLength - matrix.length; // 合并开始的行，前面的行都是 0，可以忽略

    // 因为 tower 是倒置的，

    let i = resultLength;
    while (i--) {
      if (i < startRow) break;
      if (!tower[i]) {
        tower[i] = new Array(gridX).fill(0);
      }
      const shapeRow = matrix[resultLength - i - 1];
      tower[i].map((_, index) => {
        const j = index - x;
        if (j > -1 && shapeRow[j]) {
          tower[i][index] = shapeRow[j];
        }
      });
    }
  }

  public handler = {
    up: () => {},
    down: () => {
      this.onHandleDown();
    },
    toLeft: () => {
      this.onHandleLeft();
    },
    toRight: () => {
      this.onHandleRight();
    },
    start: () => {
      this.gameStart();
    },
    home: () => {},
    oprY: () => {
      this.gameSuspend();
    },
    oprX: () => {
      this.onHandleRotateLeft();
    },
    oprA: () => {},
    oprB: () => {
      this.onHandleRotateRight();
    },
    speedUp: () => {
      this.speedUp();
    },
  };

  public speedUp() {
    this.moveStep += 0.1;
    console.log("speedUp", this.frames);
  }

  public setSubscriber(fn: Function) {
    this.subscriber = fn;
  }
}

export default Tetris;

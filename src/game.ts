class GameRole {
  name: string = "";
  speed: number = 0;
  speedUp(speed: number) {
    this.speed = speed;
  }
}

interface GameHandlerTypes {
  up: Function;
  down: Function;
  toLeft: Function;
  toRight: Function;
  start: Function;
  home: Function;
  oprY: Function;
  oprX: Function;
  oprA: Function;
  oprB: Function;
}

type GameStatus = "init" | "loading" | "ready" | "start" | "over" | "suspend";

type Color = string;

type SceneBackgroundType = {
  color: Color;
  bgImage?: ImageBitmap;
};

class Scene {
  grids: [number, number] = [20, 20];
  gridSize?: number = 0;
  width: number = 500;
  height: number = 500;
  background: SceneBackgroundType = {
    color: "#000",
  };
  constructor(props: Scene) {
    const { width, height, grids } = props;
    this.width = width;
    this.height = height;
    this.grids = grids;
  }
}

class Game {
  title: string = "demo1";
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected status: GameStatus = "init";

  protected scene: Scene;

  // score: number = 0;
  // speed: number = 0;

  protected gameStartAt: EpochTimeStamp = 0;
  isRenderProcessing: boolean = false;
  frameFlashAt: EpochTimeStamp = 0;

  protected players: GameRole[] = [];

  public handler: GameHandlerTypes = {
    up: () => {},
    down: () => {},
    toLeft: () => {},
    toRight: () => {},
    start: () => {
      this.gameStart();
    },
    home: () => {},
    oprY: () => {},
    oprX: () => {},
    oprA: () => {},
    oprB: () => {},
  };

  /**
   * This is a constructor function for a TypeScript class that initializes a canvas element and sets its
   * width, height, and context.
   * @param {HTMLCanvasElement} canvas - The canvas parameter is an HTMLCanvasElement, which represents
   * the canvas element in the HTML document. It is used to draw graphics on the web page.
   * @param options - The `options` parameter is an object that contains the following properties:
   */
  constructor(
    canvas: HTMLCanvasElement,
    options: { width: number; height: number; grids: [number, number] } = {
      width: 400,
      height: 560,
      grids: [20, 30],
    }
  ) {
    // super(props)
    canvas.width = options.width;
    canvas.height = options.height;
    canvas.style.width = `${options.width}px`;
    canvas.style.height = `${options.height}px`;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("canvas context invalid");
    }
    this.canvas = canvas;
    this.ctx = ctx;

    this.scene = new Scene({
      width: options.width,
      height: options.height,
      grids: options.grids,
      background: {
        color: "#000",
      },
    });
    // this.init();
  }

  /**
   * The `_init` function initializes the game by setting the status to "loading", waiting for the game
   * to finish loading, rendering the game, and finally marking the game as ready.
   */
  private async _init() {
    this.status = "loading";
    await this.gameLoading();
    await this.gameRender();
    this.gameReady();
  }
  init() {
    this._init();
  }
  /**
   * onInit
   * some comment
   *
   * */

  onInit() {}
  // 资源加载
  private gameLoading() {
    this.sceneLoading();
    this.stageLoading();
  }
  /**
   * @sceneLoading
   * The function calculates the grid size for the scene based on the width, height, and number of grids,
   * and then calls the onSceneLoading function.
   */
  private sceneLoading() {
    const {
      scene: {
        width,
        height,
        grids: [x, y],
      },
    } = this;
    this.scene.gridSize = Math.floor(Math.min(width / x, height / y) / 2) * 2;
    this.onSceneLoading();
  }
  private stageLoading() {
    this.onStageLoading();
  }

  /**
   * @stageReLoad 舞台重载
   * use for scene need reload object or resource，
   * including reset  and redraw object and background
   * */
  public stageReLoad() {
    this.stageLoading();
  }

  // 初始化渲染
  private gameRender() {
    this.sceneRender();
    this.stageRender();
  }
  private sceneRender() {
    this.renderBackground();

    this.onSceneRender();
  }
  protected stageRender() {
    this.onStageRender();
  }
  /**
   * @renderBackground
   * draw canvas with grid background
   *
   * The `renderBackground` function is responsible for rendering the background of a scene with a grid
   * pattern.
   */
  protected renderBackground() {
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

  /**
   * @resetStage 重置舞台
   * redraw canvas, including background and object
   *
   * The function "resetStage" clears the canvas and renders the game.
   * @returns If the condition `if (!this.scene)` is true, then nothing is being returned. If the
   * condition is false, then the `this.gameRender()` function is being returned.
   */
  protected resetStage() {
    if (!this.scene) return;
    this.ctx.clearRect(0, 0, this.scene?.width, this.scene?.height);
    this.gameRender();
  }

  // 游戏状态方法
  private gameReady() {
    this.status = "ready";
    this.onGameReady();
  }
  /**
   * The function "gameStart" sets the status to "start", records the start time of the game, and
   * triggers the "onGameStart" event.
   */
  protected gameStart() {
    this.status = "start";
    this.gameStartAt = +new Date();
    this.onGameStart();
  }
  /**
   * The gameSuspend function sets the status to "suspend" and triggers the onGameSuspend event.
   */
  protected gameSuspend() {
    this.status = "suspend";
    this.onGameSuspend();
  }
  /**
   * The `gameOver` function sets the status of the game to "over" and triggers the `onGameOver` event.
   */
  protected gameOver() {
    this.status = "over";
    this.onGameOver();
  }

  /*  */
  protected gameAccountResult() {
    this.gameAccountResult();
  }

  // 资源加载事件
  /**
   * @onSceneLoading
   * 事件 onSceneLoading 场景加载中
   *
   * */
  public onSceneLoading() {}
  /**
   * @onStageLoading
   * 事件 onStageLoading 舞台加载中
   * */
  public onStageLoading() {}
  /**
   * @onSceneRender
   * 事件 onSceneRender 场景渲染
   * */
  public onSceneRender() {}
  /**
   * @onStageRender
   * 事件 onStageRender 舞台渲染
   * */
  public onStageRender() {}

  // 游戏状态事件

  public onGameReady() {}
  public onGameStart() {}
  public onGameSuspend() {}
  public onGameOver() {}

  /**
   *
   */
  public onGameAccountResult() {}
}

export default Game;

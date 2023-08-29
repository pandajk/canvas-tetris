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

  private async _init() {
    this.status = "loading";
    await this.gameLoading();
    await this.gameRender();
    this.gameReady();
  }
  init() {
    this._init();
  }
  onInit() {}
  // 资源加载
  private gameLoading() {
    this.sceneLoading();
    this.stageLoading();
  }
  private sceneLoading() {
    this.onSceneLoading();
  }
  private stageLoading() {
    this.onStageLoading();
  }

  // 初始化渲染
  private gameRender() {
    this.sceneRender();
    this.stageRender();
  }
  private sceneRender() {
    this.onSceneRender();
  }
  protected stageRender() {
    this.onStageRender();
  }

  // 重置舞台
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
  protected gameStart() {
    this.status = "start";
    this.gameStartAt = +new Date();
    this.onGameStart();
  }
  protected gameSuspend() {
    this.status = "suspend";
    this.onGameSuspend();
  }
  protected gameOver() {
    this.status = "over";
    this.onGameOver();
  }

  // 资源加载事件
  public onSceneLoading() {}
  public onStageLoading() {}
  public onSceneRender() {}
  public onStageRender() {}

  // 游戏状态事件
  public onGameReady() {}
  public onGameStart() {}
  public onGameSuspend() {}
  public onGameOver() {}
}

export default Game;

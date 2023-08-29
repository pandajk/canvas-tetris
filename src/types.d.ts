type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

type GameHandleAction =
  | "HOME"
  | "START"
  | "up"
  | "down"
  | "left"
  | "right"
  | "Y"
  | "X"
  | "A"
  | "B";

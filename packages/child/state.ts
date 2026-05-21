export type State = {
  sent: boolean;
  firstRun: boolean;
  teardown: Array<() => void>;
};

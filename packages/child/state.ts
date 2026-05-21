export type State = {
  sent: boolean;
  firstRun: boolean;
  teardown: Array<() => void>;
  iframeId?: string;
  parentWindow?: Window;
  parentOrigin?: string;
};

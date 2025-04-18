export interface ISubBehaviour {
  get effectDuration(): number;
  prepare(): boolean;
  run(): boolean;
  select(): boolean;
  effect(): boolean;
  clone(): ISubBehaviour;
}

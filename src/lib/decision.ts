/** Deliberately synthetic explainer. Never imports a wallet, API client or transaction code. */
export type ExampleInput = { amount: number; limit: number; age: number; stopped: boolean }
export type ExampleResult = { allowed: boolean; reason: 'stop' | 'age' | 'limit' | 'allow'; fresh: boolean; capital: boolean }
export function evaluateExample({amount,limit,age,stopped}: ExampleInput): ExampleResult {
  const valid=[amount,limit,age].every(Number.isFinite)&&amount>0&&limit>=0&&age>=0
  const fresh=valid&&age<=30, capital=valid&&amount<=limit
  return {allowed:valid&&!stopped&&fresh&&capital,reason:stopped?'stop':!fresh?'age':!capital?'limit':'allow',fresh,capital}
}

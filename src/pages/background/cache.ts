/**
 * Cache
 * - badge: バッジ(=メモの数を示す)を保持する
 */
const cache: {
  badge: {
    [key: string]: number;
  }
} = {
  badge: {},
}

Object.freeze(cache);
export { cache };
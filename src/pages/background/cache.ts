import { User } from "../../types/User";

/**
 * Cache
 * - badge: バッジ(=メモの数を示す)を保持する
 */
const cache: {
  badge: {
    [key: string]: number;
  };
  user?: User;
} = {
  badge: {},
  user: undefined,
}

// Object.freeze(cache);
export { cache };
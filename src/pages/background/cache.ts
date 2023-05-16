const cache: {
  badge: {
    [key: string]: number;
  }
} = {
  badge: {},
}

Object.freeze(cache);
export { cache };
import { DbItem } from '../contracts/DbItem';

/**
 * @description Calculate (generate) a database key for the provided item.
 */
export function calculateDbKey(item: DbItem) {
  const { type, name, version } = item;
  return `${type}#${name}@${version}`;
}

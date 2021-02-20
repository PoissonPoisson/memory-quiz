/**
 * Interface of server global data.
 */
export interface ServerData {
  /**
   * Best score in the server.
   * /!\ Warning if change number of rounds in environment variables file /!\
   */
  bestScore: number;
  /** Count number of games played. */
  gameCounter: number;
}

export type Url = {
  /**
   * HTTP method.
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';
  /**
   * The URL.
   * @example '/dependencies'
   */
  pathname: string;
  /**
   * Any query parameter we have received.
   * @example '?demo-provider%401.0.0'
   */
  search?: string;
};

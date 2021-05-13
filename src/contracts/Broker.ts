export type BrokerResponse = {
  responseData: string;
  status: number;
};

export type BrokerRequest = {
  body: string | undefined;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';
  url: {
    pathname: string;
    search: string;
  };
};

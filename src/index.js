import React from 'react';
import * as ReactApollo from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { print } from 'graphql/language/printer';

import sinon from 'sinon';

export const createApolloClient = uri => {
  const httpLink = new HttpLink({
    uri,
  });

  const cache = new InMemoryCache({ addTypename: false });

  return new ApolloClient({
    link: httpLink,
    cache,
  });
};

export const stubQueryWith = (uri, payload, result) => {
  const promise = Promise.resolve({
    text: () => Promise.resolve(JSON.stringify({ data: result })),
  });

  const args = {
    method: 'POST',
    headers: { accept: '*/*', 'content-type': 'application/json' },
    credentials: undefined,
    body: JSON.stringify({
      operationName: payload.operationName || null,
      variables: payload.variables || {},
      query: print(payload.query),
    }),
  };

  sinon
    .stub(global, 'fetch')
    .withArgs(uri, args)
    .returns(promise);

  return promise;
};

export const injectSpyInMutation = (result = {}) => {
  const spy = sinon.spy();

  ReactApollo.Mutation = ({ mutation, variables, children }) => (
    <div>{children(() => spy({ mutation, variables }), result)}</div>
  );

  jest.setMock('react-apollo', ReactApollo);

  return spy;
};

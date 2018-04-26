import React from 'react';
import ReactDOM from 'react-dom';

import * as ReactApollo from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme';

configure({ adapter: new Adapter() });

const createTestClient = () => {
  const httpLink = new HttpLink({
    uri: 'https://api.github.com/graphql',
  });

  const cache = new InMemoryCache({ addTypename: false });

  return new ApolloClient({
    link: httpLink,
    cache,
  });
};

export const createGraphQLPromise = data => {
  return Promise.resolve({
    text: () => Promise.resolve(JSON.stringify(data)),
  });
};

export const mockMutationComponent = spy => {
  ReactApollo.Mutation = ({ mutation, variables, children }) => (
    <div>{children(() => spy({ mutation, variables }))}</div>
  );

  jest.setMock('react-apollo', ReactApollo);
};

export default createTestClient;

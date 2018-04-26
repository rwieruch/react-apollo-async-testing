import React from 'react';
import ReactDOM from 'react-dom';

import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import renderer from 'react-test-renderer';
import Adapter from 'enzyme-adapter-react-16';
import { mount, configure } from 'enzyme';
import sinon from 'sinon';

import App, { GET_REPOSITORIES_OF_VIEWER } from './App';

// Best: Configure it somewhere globally for all test files (see: https://www.robinwieruch.de/react-testing-tutorial/#react-enzyme-test-setup)
configure({ adapter: new Adapter() });

const MOCK_DATA = {
  data: {
    viewer: {
      name: 'Robin Wieruch',
      repositories: {
        edges: [
          {
            node: {
              id: '1',
              name: 'foo',
              url: 'https://foo.com',
            },
          },
          {
            node: {
              id: '2',
              name: 'bar',
              url: 'https://bar.com',
            },
          },
          {
            node: {
              id: '3',
              name: 'qwe',
              url: 'https://qwe.com',
            },
          },
        ],
      },
    },
  },
};

const GET_REPOSITORIES_OF_VIEWER_RESPONSE_MOCK = {
  request: {
    query: GET_REPOSITORIES_OF_VIEWER,
    variables: {},
  },
  result: MOCK_DATA,
};

let promise;
let client;

const createGraphQLPromise = data => {
  return Promise.resolve({
    text: () => Promise.resolve(JSON.stringify(data)),
  });
};

beforeEach(() => {
  promise = createGraphQLPromise(MOCK_DATA);

  sinon
    .stub(global, 'fetch')
    .withArgs('https://api.github.com/graphql')
    .returns(promise);

  const httpLink = new HttpLink({
    uri: 'https://api.github.com/graphql',
  });

  const cache = new InMemoryCache({ addTypename: false });

  client = new ApolloClient({
    link: httpLink,
    cache,
  });
});

afterEach(() => {
  fetch.restore();
});

test('it makes use of the Query render prop', done => {
  const wrapper = mount(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
  );

  expect(wrapper.find('[data-test-id="loading"]')).toHaveLength(1);

  promise.then().then(() => {
    // Without setTimeout it still shows the
    // loading indicator [data-test-id="loading"]
    // even though the query result's data comes in
    // the render props function
    setTimeout(() => {
      wrapper.update();

      expect(wrapper.find('[data-test-id="profile"]')).toHaveLength(
        1,
      );

      done();
    });
  });
});

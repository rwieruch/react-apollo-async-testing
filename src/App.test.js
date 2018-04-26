import React from 'react';
import ReactDOM from 'react-dom';

import { ApolloProvider } from 'react-apollo';
import { mount } from 'enzyme';
import sinon from 'sinon';

import createTestClient, {
  createApolloExpectedPromise,
} from './test/util';
import { MOCK_VIEWER_WITH_REPOSITORIES } from './test/mocks';

import App, { GET_REPOSITORIES_OF_VIEWER } from './App';

let client;
let promise;

beforeAll(() => {
  promise = createApolloExpectedPromise(
    MOCK_VIEWER_WITH_REPOSITORIES,
  );

  sinon
    .stub(global, 'fetch')
    .withArgs('https://api.github.com/graphql')
    .returns(promise);

  client = createTestClient();
});

afterAll(() => {
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
    // Without setImmediate it still shows the
    // loading indicator [data-test-id="loading"]
    // even though the query result's data comes in
    // the render props function. Dealing with these race conditions
    // feels kinda hacky.
    setImmediate(() => {
      wrapper.update();

      expect(wrapper.find('[data-test-id="profile"]')).toHaveLength(
        1,
      );

      done();
    });
  });
});

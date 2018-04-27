import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';

import { mount } from 'enzyme';
import {
  createApolloClient,
  injectSpyInMutation,
} from 'react-apollo-async-testing';

import './test/setup';

import Repository, { WATCH_REPOSITORY, isWatch } from './Repository';

let client;
let sinonSpy;

beforeAll(() => {
  sinonSpy = injectSpyInMutation();

  client = createApolloClient('https://api.github.com/graphql');
});

test('interaction with mutation function from the Mutation component', () => {
  const repository = {
    id: '1',
    name: 'foo',
    url: 'https://foo.com',
    viewerSubscription: 'UNSUBSCRIBED',
  };

  const wrapper = mount(
    <ApolloProvider client={client}>
      <Repository repository={repository} />
    </ApolloProvider>,
  );

  wrapper.find('button').simulate('click');

  expect(sinonSpy.calledOnce).toEqual(true);

  const expectedObject = {
    mutation: WATCH_REPOSITORY,
    variables: {
      id: repository.id,
      viewerSubscription: 'SUBSCRIBED',
    },
  };

  expect(sinonSpy.calledWith(expectedObject)).toEqual(true);
});

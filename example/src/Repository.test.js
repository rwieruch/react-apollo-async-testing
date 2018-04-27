import React from 'react';
import ReactDOM from 'react-dom';

import { ApolloProvider } from 'react-apollo';
import { mount } from 'enzyme';

import './test/setup';
import { createApolloClient, injectSpyInMutation } from './test/lib';

import Repository, { WATCH_REPOSITORY, isWatch } from './Repository';

let client;
let sinonSpy;

beforeAll(() => {
  sinonSpy = injectSpyInMutation();

  client = createApolloClient('https://api.github.com/graphql');
});

test('it makes use of the Mutation render prop', () => {
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

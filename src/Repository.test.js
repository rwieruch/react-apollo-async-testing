import React from 'react';
import ReactDOM from 'react-dom';

import { ApolloProvider } from 'react-apollo';
import { mount } from 'enzyme';
import sinon from 'sinon';

import createTestClient, { mockMutationComponent } from './test/util';
import { MOCK_REPOSITORY } from './test/mocks';

import Repository, { WATCH_REPOSITORY, isWatch } from './Repository';

let client;
let mutationSpy;

beforeAll(() => {
  client = createTestClient();

  mutationSpy = sinon.spy();
  mockMutationComponent(mutationSpy);
});

test('it makes use of the Mutation render prop', () => {
  const wrapper = mount(
    <ApolloProvider client={client}>
      <Repository repository={MOCK_REPOSITORY} />
    </ApolloProvider>,
  );

  wrapper.find('button').simulate('click');

  expect(mutationSpy.calledOnce).toEqual(true);

  const expectedObject = {
    mutation: WATCH_REPOSITORY,
    variables: {
      id: MOCK_REPOSITORY.id,
      viewerSubscription: 'SUBSCRIBED',
    },
  };

  expect(mutationSpy.calledWith(expectedObject)).toEqual(true);
});

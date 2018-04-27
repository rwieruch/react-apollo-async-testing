# react-apollo-async-testing

**Beta:** A lightweight way to test your Mutation and Query components in React Apollo ([react-apollo](https://github.com/apollographql/react-apollo)).

## Install & Usage

On the command line:

`npm install --save-dev react-apollo-async-testing`

The following test examples showcase this library by using [Jest](https://facebook.github.io/jest/) as assertion and test runner library and [Enzyme](http://airbnb.io/enzyme/) for the actual component renderings and utilities. But Enzyme can be replaced by [react-test-renderer](https://www.npmjs.com/package/react-test-renderer) as well.

### API:

```javascript
// creates a Apollo Client with sensible defaults (e.g. apollo-cache-inmemory, apollo-http-link)
// just an optional function, you can create your own Apollo Client instance too
// afterward, client instance can be used in the ApolloProvider
const client = createApolloClient('https://api.github.com/graphql');

// enables GraphQL API mocking
// define the GraphQL endpoint URI
// specify a payload object which has a query (and optional variables and operation name)
// specify a result which you would expect from this query
const promise = stubQueryWith(uri, payload, result);

// injects a spied function into the Mutation(s) component(s)
// check sinon library API to interact with the spy
const sinonSpy = injectSpyInMutation();
```

### Query Testing:

The desired goal is to keep you in control of **what data** should be returned for **which request**. In addition, you need to be in charge to **mimic the different stages** of the request by having control over a promise (e.g. pending request, resolved request).

**In your application:**

```javascript
import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import Repository from './Repository';

export const GET_REPOSITORIES_OF_VIEWER = gql`
  {
    viewer {
      name
      repositories(last: 25) {
        edges {
          node {
            id
            name
            url
            viewerSubscription
          }
        }
      }
    }
  }
`;

const App = () => (
  <Query query={GET_REPOSITORIES_OF_VIEWER}>
    {({ data, loading, error }) => {
      const { viewer } = data;

      if (loading) {
        return <div data-test-id="loading">Loading ...</div>;
      }

      if (error) {
        return <div data-test-id="error">Error ...</div>;
      }

      if (!viewer) {
        return <div data-test-id="no-data">No data ...</div>;
      }

      return (
        <div>
          <div data-test-id="profile">{viewer.name}</div>
          <ul>
            {viewer.repositories.edges.map(({ node }) => (
              <li key={node.id}>
                <Repository repository={node} />
              </li>
            ))}
          </ul>
        </div>
      );
    }}
  </Query>
);

export default App;
```

**In your test:**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';

import { mount } from 'enzyme';
import {
  createApolloClient,
  stubQueryWith,
} from 'react-apollo-async-testing';

import App, { GET_REPOSITORIES_OF_VIEWER } from './App';

let client;
let promise;

const viewerWithRepositories = {
  viewer: {
    name: 'Robin Wieruch',
    repositories: {
      edges: [
        {
          node: {
            id: '1',
            name: 'bar',
            url: 'https://bar.com',
            viewerSubscription: 'UNSUBSCRIBED',
          },
        },
        {
          node: {
            id: '2',
            name: 'qwe',
            url: 'https://qwe.com',
            viewerSubscription: 'UNSUBSCRIBED',
          },
        },
      ],
    },
  },
};

beforeAll(() => {
  promise = stubQueryWith(
    'https://api.github.com/graphql',
    {
      query: GET_REPOSITORIES_OF_VIEWER,
    },
    viewerWithRepositories,
  );

  client = createApolloClient('https://api.github.com/graphql');
});

afterAll(() => {
  // since the fetch API is stubbed with the library
  // it has to be restored after the tests
  fetch.restore();
});

test('query result of Query component', done => {
  const wrapper = mount(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
  );

  expect(wrapper.find('[data-test-id="loading"]')).toHaveLength(1);

  promise.then().then(() => {
    setImmediate(() => {
      wrapper.update();

      expect(wrapper.find('[data-test-id="profile"]')).toHaveLength(
        1,
      );
      expect(wrapper.find('[data-test-id="profile"]').text()).toEqual(
        viewerWithRepositories.viewer.name,
      );

      done();
    });
  });
});
```

### Mutation Testing:

The desired goal is to **have a spied function which is used within the Mutation component**'s children as a function to execute the actual mutation. Only then it is possible to make assertions for the executed mutation.

**In your application:**

```javascript
import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

export const WATCH_REPOSITORY = gql`
  mutation($id: ID!, $viewerSubscription: SubscriptionState!) {
    updateSubscription(
      input: { state: $viewerSubscription, subscribableId: $id }
    ) {
      subscribable {
        id
        viewerSubscription
      }
    }
  }
`;

const VIEWER_SUBSCRIPTIONS = {
  SUBSCRIBED: 'SUBSCRIBED',
  UNSUBSCRIBED: 'UNSUBSCRIBED',
};

const isWatch = viewerSubscription =>
  viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED;

const Repository = ({
  repository: { id, url, name, viewerSubscription },
}) => (
  <div>
    <a href={url}>{name}</a>

    <Mutation
      mutation={WATCH_REPOSITORY}
      variables={{
        id,
        viewerSubscription: isWatch(viewerSubscription)
          ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
          : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
      }}
    >
      {updateSubscription => (
        <button type="button" onClick={updateSubscription}>
          {isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
        </button>
      )}
    </Mutation>
  </div>
);

export default Repository;
```

**In your test:**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';

import { mount } from 'enzyme';
import {
  createApolloClient,
  injectSpyInMutation,
} from 'react-apollo-async-testing';

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
```

## Example

A simple example application which uses tested Mutation and Query components can be found in the *example/* folder.

### Install:

* `git clone git@github.com:rwieruch/react-apollo-async-testing.git`
* `cd react-apollo-async-testing/example`
* `npm install`

### Run tests:

* `npm test`

### Run application:

* [add your own REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN in .env file](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
  * scopes/permissions you need to check: admin:org, repo, user, notifications
* `npm start`
* visit `http://localhost:3000`
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

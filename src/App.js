import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

export const GET_REPOSITORIES_OF_VIEWER = gql`
  {
    viewer {
      name
      repositories(last: 5) {
        edges {
          node {
            id
            name
            url
          }
        }
      }
    }
  }
`;

const App = () => (
  <Query query={GET_REPOSITORIES_OF_VIEWER}>
    {({ data, loading, error }) => {
      console.log(data);

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
          <Repositories repositories={viewer.repositories} />
        </div>
      );
    }}
  </Query>
);

export const Repositories = ({ repositories }) => (
  <ul>
    {repositories.edges.map(({ node }) => (
      <li key={node.id}>
        <a href={node.url}>{node.name}</a>
      </li>
    ))}
  </ul>
);

export default App;

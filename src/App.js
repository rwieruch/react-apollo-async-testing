import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_REPOSITORIES_OF_VIEWER = gql`
  {
    viewer {
      name
      repositories(first: 5) {
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
      const { viewer } = data;

      if (loading) {
        return <div>Loading ...</div>;
      }

      if (error) {
        return <div>Error ...</div>;
      }

      if (!viewer) {
        return <div>No data ...</div>;
      }

      return (
        <div>
          <div className="profile">{viewer.name}</div>
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

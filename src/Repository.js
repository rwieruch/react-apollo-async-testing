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

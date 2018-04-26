export const MOCK_REPOSITORY = {
  id: '1',
  name: 'foo',
  url: 'https://foo.com',
  viewerSubscription: 'UNSUBSCRIBED',
};

export const MOCK_REPOSITORIES = {
  edges: [
    { node: MOCK_REPOSITORY },
    {
      node: {
        id: '2',
        name: 'bar',
        url: 'https://bar.com',
        viewerSubscription: 'UNSUBSCRIBED',
      },
    },
    {
      node: {
        id: '3',
        name: 'qwe',
        url: 'https://qwe.com',
        viewerSubscription: 'UNSUBSCRIBED',
      },
    },
  ],
};

export const MOCK_VIEWER_WITH_REPOSITORIES = {
  data: {
    viewer: {
      name: 'Robin Wieruch',
      repositories: MOCK_REPOSITORIES,
    },
  },
};

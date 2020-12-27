WikiForum.cache.pages['pageName'] = [
  // Topic 1
  {
    id: '1',
    title: 'Forum Topic 1',
    depthMax: 3,
    threads: [
      {
        id: '1',
        content: 'I am first thread!',
        meta: {
          user: {
            author: 'User1',
            last: 'User1',
          },
          time: {
            publish: '2020-12-27T8:08:00.000Z',
            modify: '2020-12-27T8:08:00.000Z',
          },
        },
      },
      {
        id: '2',
        content: 'I am second',
        meta: {
          user: {
            author: 'User2',
            last: 'User2',
          },
          time: {
            publish: '2020-12-27T8:08:01.000Z',
            modify: '2020-12-27T8:08:01.000Z',
          },
        },
        threads: [
          {
            id: '2-1',
            content: 'I am the reply in the second thread',
            meta: {
              user: {
                author: 'User3',
                last: 'User3',
              },
              time: {
                publish: '2020-12-27T8:08:02.000Z',
                modify: '2020-12-27T8:08:02.000Z',
              },
            },
          },
        ],
      },
      {
        id: '3',
        content: 'I am third',
        meta: {
          user: {
            author: 'User4',
            last: 'User4',
          },
          time: {
            publish: '2020-12-27T8:08:03.000Z',
            modify: '2020-12-27T8:08:03.000Z',
          },
        },
      },
    ],
  },
  {
    // Topic 2
  },
]

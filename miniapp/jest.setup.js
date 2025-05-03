jest.mock('@callstack/repack/client', () => ({
    Federated: {
      importModule: jest.fn((container, module) => {
        if (container === 'miniapp') {
          const miniMock = require('../miniapp/mocks/federated');
          return Promise.resolve(miniMock.default(module));
        }
      }),
    },
  }));
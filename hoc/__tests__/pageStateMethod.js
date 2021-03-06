/* eslint-disable no-unused-vars */

import pageStateMethod, { translatePayload } from '../pageStateMethod';

describe('test translatePayload', () => {
  it('should give correct config by given string', () => {
    const [path, payload] = translatePayload('snackbar.loading');
    expect(path).toEqual('snackbar');
    expect(payload).toEqual({
      type: 'loading',
    });
  });

  it('should give correct config by given object', () => {
    const [path, payload] = translatePayload({ path: 'snackbar.loading', payload: { title: 'testing' } });
    expect(path).toEqual('snackbar');
    expect(payload).toEqual({
      type: 'loading',
      payload: {
        title: 'testing',
      },
    });
  });
});

describe('test pageStateMethod', () => {
  const mockFetchUser = jest.fn(args => args);

  beforeEach(() => {
    mockFetchUser.mockReset();
  });

  describe('test loading callback', () => {
    it('should call setPageState for loading config', async () => {
      const mockSetPageState = jest.fn();
      const mockResetPageState = jest.fn();
      class TestClass {
        @pageStateMethod({ loading: 'page.loading' })
        handleFetchUser = () => mockFetchUser();
      }
      const obj = new TestClass();
      obj.props = {
        setPageState: mockSetPageState,
        resetPageState: mockResetPageState,
      };
      await obj.handleFetchUser();
      expect(mockSetPageState).toHaveBeenCalledWith('page', { type: 'loading' });
      expect(mockResetPageState).toHaveBeenCalledWith('page');
    });

    it('should not call setPageState when loading is not defined', async () => {
      const mockSetPageState = jest.fn();
      const mockResetPageState = jest.fn();
      class TestClass {
        @pageStateMethod() handleFetchUser = () => mockFetchUser();
      }
      const obj = new TestClass();
      obj.props = {
        setPageState: mockSetPageState,
        resetPageState: mockResetPageState,
      };
      await obj.handleFetchUser();
      expect(mockSetPageState).not.toHaveBeenCalled();
    });
  });

  it('should call setPageState for success config', async () => {
    const mockSetPageState = jest.fn();
    const mockResetPageState = jest.fn();
    class TestClass {
      @pageStateMethod({ success: 'page.success' })
      handleFetchUser = () => mockFetchUser();
    }
    const obj = new TestClass();
    obj.props = {
      setPageState: mockSetPageState,
      resetPageState: mockSetPageState,
    };
    await obj.handleFetchUser();
    expect(mockSetPageState).toHaveBeenCalledWith('page', { type: 'success' });
  });

  it('should call setPageState for error config', async () => {
    const mockSetPageState = jest.fn();
    const mockResetPageState = jest.fn();
    mockFetchUser.mockReturnValueOnce(new Promise((_, reject) => reject('ini error message')));
    console.error = jest.fn();
    class TestClass {
      @pageStateMethod({ error: 'page.error' })
      handleFetchUser = () => mockFetchUser();
    }
    const obj = new TestClass();
    obj.props = {
      setPageState: mockSetPageState,
      resetPageState: mockResetPageState,
    };
    await obj.handleFetchUser();
    expect(mockResetPageState).toHaveBeenCalled();
    const [firstArg, secondArg] = mockSetPageState.mock.calls[0];
    expect(firstArg).toEqual('page');
    expect(secondArg.type).toEqual('error');
    expect(secondArg.payload).toHaveProperty('error', 'ini error message');
  });

  it('should have retry function when error', async () => {
    const mockSetPageState = jest.fn();
    const mockResetPageState = jest.fn();
    mockFetchUser.mockReturnValueOnce(new Promise((_, reject) => reject('ini error message')));
    console.error = jest.fn();
    class TestClass {
      @pageStateMethod({ error: 'page.error' })
      handleFetchUser = () => mockFetchUser();
    }
    const obj = new TestClass();
    obj.props = {
      setPageState: mockSetPageState,
      resetPageState: mockResetPageState,
    };
    await obj.handleFetchUser();
    expect(mockFetchUser.mock.calls.length).toEqual(1);
    const [_, secondArg] = mockSetPageState.mock.calls[0];
    expect(secondArg.payload.retry).toBeTruthy();
    await secondArg.payload.retry();
    expect(mockFetchUser.mock.calls.length).toEqual(2);
  });

  it('should throw an exception where there is no setPageState function', async () => {
    mockFetchUser.mockReturnValueOnce(new Promise(resolve => resolve()));
    console.error = jest.fn();
    class TestClass {
      @pageStateMethod({ error: 'page.error' })
      handleFetchUser = () => mockFetchUser();
    }
    const obj = new TestClass();
    let error;
    try {
      await obj.handleFetchUser();
    } catch (e) {
      error = e;
    }
    expect(error).toBeTruthy();
  });

  it('should passing the arguments too for retry', async () => {
    const mockSetPageState = jest.fn();
    const mockResetPageState = jest.fn();
    const mockFetchUserWithReturn = jest.fn(args => args);
    mockFetchUserWithReturn.mockReturnValueOnce(new Promise((_, reject) => reject('ini error message')));
    console.error = jest.fn();
    class TestClass {
      @pageStateMethod({ error: 'page.error' })
      handleFetchUser = payload => mockFetchUserWithReturn(payload);
    }
    const obj = new TestClass();
    obj.props = {
      setPageState: mockSetPageState,
      resetPageState: mockResetPageState,
    };
    await obj.handleFetchUser(10);
    expect(mockFetchUserWithReturn.mock.calls.length).toEqual(1);
    const [_, secondArg] = mockSetPageState.mock.calls[0];
    expect(secondArg.payload.retry).toBeTruthy();
    const result = await secondArg.payload.retry();
    expect(result).toEqual(10);
  });
});

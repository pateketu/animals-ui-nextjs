import EditCatPage, { getServerSideProps } from '@/pages/cats/[catId]/edit';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'
import { testCat1 } from '__tests__/data';
import { setFetchUpMock, setUpFetchErrorMock, setUpFetchSuccessMock } from '__tests__/utils';
import Router from 'next/router'
jest.mock('next/router', ()=> ({push: jest.fn()}));

const validContext = {
  params: { catId: '1' },
  req: {},
  res: {}
}

const contextMissingParams = {
  req: {},
  res: {}
}

describe('Edit Cat Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should render without crashing', () => {
    render(<EditCatPage cat={testCat1} />)

    const h1 = screen.getByRole('heading', { level: 1 })

    expect(h1).toBeInTheDocument();
    expect(h1.textContent).toBe('Edit Smelly')
  });

  it('should edit a cat and redirects to cats page', async()=>{
    setFetchUpMock([{
        json: async () => await Promise.resolve(),
        ok: true
      }]);
    render(<EditCatPage cat={testCat1} />);

    fireEvent.change(screen.getByLabelText('Name'), {target: {value:'my cat'}});
    fireEvent.change(screen.getByLabelText('Description'), {target: {value:'my desc'}});

    await act(()=> fireEvent.click(screen.getByRole('button')));
    expect(Router.push).toHaveBeenCalledWith('/cats')
  });

  it('getServerSideProps should return account property for valid context', async () => {
    setUpFetchSuccessMock([testCat1])

    const response = await getServerSideProps(validContext as any)

    expect(response).toEqual({
      props: {
        cat: testCat1
      }
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  });

  it('getServerSideProps should return not found for invalid id', async () => {
    setUpFetchErrorMock('Not found')

    const response = await getServerSideProps(contextMissingParams as any)

    expect(response).toEqual({ notFound: true })
    expect(fetch).toHaveBeenCalledTimes(1)
  });
});

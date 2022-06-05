import { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        pauseOnHover
        closeOnClick
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

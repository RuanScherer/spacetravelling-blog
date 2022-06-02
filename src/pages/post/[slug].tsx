import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <>
      <Header />

      <div
        className={styles.postBanner}
        style={{ backgroundImage: `url("${post.data.banner.url}")` }}
      />

      <article className={styles.post}>
        <h1>{post.data.title}</h1>

        <div className={styles.postDetails}>
          <div>
            <img src="/images/calendar.svg" alt="Calendar icon" />
            <span>
              {format(new Date(post.first_publication_date), 'dd/MM/yyyy')}
            </span>
          </div>

          <div>
            <img src="/images/user.svg" alt="User icon" />
            <span>{post.data.author}</span>
          </div>

          <div>
            <img src="/images/clock.svg" alt="Clock icon" />
            <span>{post.data.author}</span>
          </div>
        </div>
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    fetch: ['uid'],
  });

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid },
    })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  const post = {
    first_publication_date: response.first_publication_date,
    data: response.data,
  };

  return {
    props: {
      post,
    },
  };
};

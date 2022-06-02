import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
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
  console.log(post.data.content);

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
            <FiCalendar />
            <span>
              {format(new Date(post.first_publication_date), 'dd/MM/yyyy')}
            </span>
          </div>

          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>

          <div>
            <FiClock />
            <span>{post.data.author}</span>
          </div>
        </div>

        {post.data.content.map((content, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <h2>{content.heading}</h2>

            <div
              className={styles.postContent}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: 'teste' }}
            />
          </div>
        ))}
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
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug));

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      ...response.data,
      content: response.data.content.reduce(
        (postContent, { heading, body }) => {
          postContent.push({
            heading,
            body: RichText.asHtml(body),
          });
          return postContent;
        },
        []
      ),
    },
  };

  return {
    props: {
      post,
    },
  };
};

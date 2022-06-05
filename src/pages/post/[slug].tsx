import { predicate } from '@prismicio/client';
import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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

interface PostSuggestion {
  uid: string | null;
  title: string | null;
}

interface PostProps {
  previousPostSuggestion: PostSuggestion | null;
  post: Post;
  nextPostSuggestion: PostSuggestion | null;
}

export default function Post({
  previousPostSuggestion,
  post,
  nextPostSuggestion,
}: PostProps): JSX.Element {
  const router = useRouter();

  const postContentWordsCount = post.data.content.reduce(
    (accumulator, content) => {
      const headingWordsCount = content.heading.split(' ').length;
      const contentWordsCount = RichText.asHtml(content.body).split(' ').length;
      return accumulator + contentWordsCount + headingWordsCount;
    },
    0
  );

  const readingTime = Math.ceil(postContentWordsCount / 200);

  if (router.isFallback) {
    return (
      <main className={`${commonStyles.container} ${styles.carregando}`}>
        <span>Carregando...</span>
      </main>
    );
  }

  return (
    <>
      <Header />

      <div
        className={styles.postBanner}
        style={{ backgroundImage: `url("${post.data.banner.url}")` }}
      />

      <article className={`${commonStyles.container} ${styles.post}`}>
        <h1>{post.data.title}</h1>

        <div className={styles.postDetails}>
          <div>
            <FiCalendar />
            <span>
              {format(
                new Date(post.first_publication_date),
                'dd MMM yyyy'
              ).toLowerCase()}
            </span>
          </div>

          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>

          <div>
            <FiClock />
            <span>{readingTime} min</span>
          </div>

          {post.first_publication_date !== post.last_publication_date && (
            <i>
              * editado em{' '}
              {format(
                new Date(post.first_publication_date),
                "dd MMM yyyy', às' HH:mm"
              ).toLowerCase()}
            </i>
          )}
        </div>

        {post.data.content.map((content, index) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index}>
              <h2 className={styles.postContentHeading}>{content.heading}</h2>

              <div
                className={styles.postContent}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          );
        })}
      </article>

      {(previousPostSuggestion || nextPostSuggestion) && (
        <div className={`${commonStyles.container}`}>
          <hr className={styles.footerSeparator} />
        </div>
      )}

      <footer className={`${commonStyles.container} ${styles.suggestions}`}>
        {previousPostSuggestion ? (
          <Link href={`/post/${previousPostSuggestion.uid}`}>
            <a>
              <span>{previousPostSuggestion.title}</span>
              <span>Post anterior</span>
            </a>
          </Link>
        ) : (
          <div />
        )}

        {nextPostSuggestion && (
          <Link href={`/post/${nextPostSuggestion.uid}`}>
            <a className={styles.nextPostSuggestion}>
              <span>{nextPostSuggestion.title}</span>
              <span>Próximo post</span>
            </a>
          </Link>
        )}
      </footer>
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
  const currentPost = await prismic.getByUID('posts', String(slug));

  const post = {
    first_publication_date: currentPost.first_publication_date,
    last_publication_date: currentPost.last_publication_date,
    data: currentPost.data,
    uid: currentPost.uid,
  };

  const previousPost = await prismic.get({
    predicates: [
      predicate.dateBefore(
        'document.first_publication_date',
        post.first_publication_date
      ),
    ],
    orderings: ['first_publication_date desc'],
    fetch: ['document.uid', 'document.data.title'],
    pageSize: 1,
  });
  let previousPostSuggestion = null;
  if (previousPost?.results.length > 0) {
    const { uid, data } = previousPost.results[0];
    previousPostSuggestion = {
      uid,
      title: data.title,
    };
  }

  const nextPost = await prismic.get({
    predicates: [
      predicate.dateAfter(
        'document.first_publication_date',
        post.first_publication_date
      ),
    ],
    fetch: ['document.uid', 'document.data.title'],
    pageSize: 1,
  });
  let nextPostSuggestion = null;
  if (nextPost?.results.length > 0) {
    const { uid, data } = nextPost.results[0];
    nextPostSuggestion = {
      uid,
      title: data.title,
    };
  }

  return {
    props: {
      previousPostSuggestion,
      post,
      nextPostSuggestion,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};

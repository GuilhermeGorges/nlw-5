import { format, parseISO } from 'date-fns';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
//import { useRouter } from 'next/router' //verifica se esta em carregamento ou não a pagina 
import { api } from '../../services/api';
import styles from './episode.module.scss'
import Image from 'next/image';
import Link from 'next/link';
import { usePlayer } from '../../contexts/PlayerContext';
import Head from 'next/head';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  url: string;
  description: string;
  //... server.json
}

type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title}| Podcastr</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }} />
    </div>
  )
}

// este método serve para que páginas estáticas que podem ser dinâmicas possam funcionar corretamente  
// quando em fallback: 'blocking' as paginas dentro de paths: [] ja são geradas estáticamente enquanto as demais páginas só irão ser geradas quando requisitadas/acessadas pelo client
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{
      params: {
        slug: 'a-importancia-da-contribuicao-em-open-source'
      }
    }],
    fallback: 'blocking'
  }
}




export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;

  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
}
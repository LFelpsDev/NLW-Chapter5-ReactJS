import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import parseISO from 'date-fns/parseISO';
import { GetStaticPaths, GetStaticProps } from 'next';
import { api } from '../../services/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';
import Head from 'next/head';
type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    published_at: string;
    duration: number;
    durationAsString: string;
    url: string;
    publishedAt: string;
    description: string;
};

type EpisodeProps = {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayer()

    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Podcastr </title>
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
                    <img src="/play.svg" alt="Tocar Episodio" />
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

//client ( browser ) - next.js (node.js ) - server (back-end)

// o fallback em true ele roda no client
// o fallback em 'blocking' vai rodar na camada do next.js (node.js)

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('episodes', {
        params: {
            _limit: 12,
            _sort: 'published_at',
            _order: 'desc'
        }
    })

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })

    return {
        paths,
        fallback: 'blocking'
    }

    // incremental static regeneration
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
        revalidate: 60 * 60 * 24, // 24 hours
    }
}
'use client'

import { TOPICS } from '@/app/lib/constants/topics'
import styles from './TopicTabs.module.css'

interface TopicTabsProps {
    activeTopic: string | null
    onSelect: (topicId: string | null) => void
}

export default function TopicTabs({ activeTopic, onSelect }: TopicTabsProps) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTopic === null ? styles.active : ''}`}
                    onClick={() => onSelect(null)}
                >
                    All
                </button>
                {TOPICS.map(topic => (
                    <button
                        key={topic.id}
                        className={`${styles.tab} ${activeTopic === topic.id ? styles.active : ''}`}
                        onClick={() => onSelect(topic.id)}
                        title={topic.description}
                    >
                        {topic.name}
                    </button>
                ))}
            </div>
        </div>
    )
}

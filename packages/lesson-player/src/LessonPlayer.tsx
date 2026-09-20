import { useRef, useState } from 'react';
import type {
  StudentLessonActivity,
  StudentLessonDocument,
  TimelineEvent,
} from '@ilp/lesson-schema';
import { Badge, Card } from '@ilp/shared-ui';
import { MarkdownContent } from './markdown';
import { safeHref } from './markdown-parser';
import { advanceTimeline, resetTimeline, type TimelineState } from './timeline';

interface LessonPlayerProps {
  lesson: StudentLessonDocument;
}

function activityTitle(activity: StudentLessonActivity): string {
  if (activity.type === 'quiz') return activity.question;
  if (activity.type === 'quick-code') return `Thực hành ${activity.runtime}`;
  return 'Thực hành dự án local';
}

function eventTitle(event: TimelineEvent, lesson: StudentLessonDocument): string {
  if (event.action === 'openResource') return 'Mở tài nguyên tham khảo';
  const activity = lesson.activities.find(({ id }) => id === event.targetId);
  return activity ? activityTitle(activity) : 'Checkpoint học tập';
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timeline, setTimeline] = useState<TimelineState>(resetTimeline());
  const [videoState, setVideoState] = useState<'idle' | 'ready' | 'error'>('idle');
  const [announcement, setAnnouncement] = useState('');
  const [activeActivityId, setActiveActivityId] = useState<string | undefined>();
  const [answeredQuizIds, setAnsweredQuizIds] = useState<ReadonlySet<string>>(new Set());
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selfChecklist, setSelfChecklist] = useState<ReadonlySet<string>>(new Set());
  const onMediaTime = (nextTime: number) => {
    setTimeline((previous) => {
      const transition = advanceTimeline(lesson.timeline, previous, nextTime);
      if (transition.fired.length > 0) {
        const first = transition.fired[0]!;
        setAnnouncement(`Đã đến checkpoint: ${eventTitle(first, lesson)}.`);
        if (first.action !== 'openResource') setActiveActivityId(first.targetId);
      }
      return transition.state;
    });
  };

  const seekTo = (time: number) => {
    if (!videoRef.current || videoState === 'error') {
      setAnnouncement('Video chưa có tệp media khả dụng để tua đến mốc này.');
      return;
    }
    videoRef.current.currentTime = time;
    videoRef.current.focus();
  };

  const submitQuiz = (activityId: string) => {
    if (!selectedOptions[activityId]) return;
    setAnsweredQuizIds((current) => new Set([...current, activityId]));
    setAnnouncement('Đã ghi nhận câu trả lời formative; chưa phải điểm chính thức.');
  };

  const toggleSelfChecklist = (id: string) => {
    setSelfChecklist((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="lesson-player">
      <section className="lesson-hero" aria-labelledby="lesson-title">
        <div>
          <span className="eyebrow">Bài học / {lesson.id}</span>
          <h1 id="lesson-title">{lesson.title}</h1>
          <p>Học theo checkpoint, tự kiểm tra và lưu bằng chứng học tập ở các slice tiếp theo.</p>
        </div>
        <Badge tone="info">FORMATIVE</Badge>
      </section>

      <div className="lesson-notice" role="status">
        <strong>Chế độ demo.</strong> Câu trả lời và checklist hiện chỉ nằm trong phiên trình duyệt;
        chưa có backend persistence.
      </div>

      <div className="lesson-layout">
        <main className="lesson-main">
          <Card>
            <div className="lesson-section-heading">
              <div>
                <span className="eyebrow">Nội dung</span>
                <h2>Mục tiêu bài học</h2>
              </div>
              <Badge tone="success">{lesson.objectives.length} mục tiêu</Badge>
            </div>
            <ul className="objective-list">
              {lesson.objectives.map((objective) => (
                <li key={objective.id}>{objective.text}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="lesson-section-heading">
              <div>
                <span className="eyebrow">Bài đọc</span>
                <h2>Khám phá nội dung</h2>
              </div>
              <Badge>Markdown an toàn</Badge>
            </div>
            <div className="content-blocks">
              {lesson.contentBlocks.map((block) => {
                if (block.type === 'markdown') {
                  return <MarkdownContent key={block.id} markdown={block.markdown} />;
                }
                if (block.type === 'code') {
                  return (
                    <pre className="lesson-code-block" key={block.id}>
                      <code>{block.code}</code>
                    </pre>
                  );
                }
                if (block.type === 'image') {
                  return (
                    <figure key={block.id}>
                      <img src={block.assetRef} alt={block.alt} />
                      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
                    </figure>
                  );
                }
                const href = safeHref(block.url);
                return (
                  <div className="resource-block" key={block.id}>
                    <span aria-hidden="true">↗</span>
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer">
                        {block.title}
                      </a>
                    ) : (
                      <span>{block.title} (liên kết bị chặn)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="lesson-section-heading">
              <div>
                <span className="eyebrow">Media</span>
                <h2>Video và checkpoint</h2>
              </div>
              <Badge tone={videoState === 'error' ? 'warning' : 'info'}>
                {videoState === 'error' ? 'Thiếu media' : 'Native video'}
              </Badge>
            </div>
            {lesson.media ? (
              <div className="video-frame">
                <video
                  ref={videoRef}
                  controls
                  preload="metadata"
                  src={lesson.media.videoRef}
                  onCanPlay={() => setVideoState('ready')}
                  onError={() => setVideoState('error')}
                  onTimeUpdate={(event) => onMediaTime(event.currentTarget.currentTime)}
                  aria-label={`Video bài học ${lesson.title}`}
                >
                  {lesson.media.subtitleRef ? (
                    <track
                      kind="captions"
                      src={lesson.media.subtitleRef}
                      srcLang="vi"
                      label="Tiếng Việt"
                    />
                  ) : null}
                  Trình duyệt không hỗ trợ video.
                </video>
                {videoState === 'error' ? (
                  <p className="media-fallback" role="alert">
                    Không tải được video fixture. Nội dung đọc và checkpoint vẫn có thể kiểm tra;
                    không hiển thị trạng thái phát giả.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="media-fallback" role="status">
                Bài mẫu chưa có video. Checkpoint chỉ được kích hoạt khi media thật phát qua
                `currentTime`.
              </div>
            )}
            {lesson.chapters?.length ? (
              <>
                <h3 className="timeline-subheading">Chapters</h3>
                <ol className="checkpoint-list" aria-label="Danh sách chapter">
                  {lesson.chapters.map((chapter) => (
                    <li key={chapter.id}>
                      <button type="button" onClick={() => seekTo(chapter.startSec)}>
                        <span>{formatTime(chapter.startSec)}</span>
                        <strong>{chapter.title}</strong>
                      </button>
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
            <h3 className="timeline-subheading">Checkpoints</h3>
            <ol className="checkpoint-list" aria-label="Danh sách checkpoint">
              {lesson.timeline.map((event) => (
                <li key={event.id}>
                  <button type="button" onClick={() => seekTo(event.atSec)}>
                    <span>{formatTime(event.atSec)}</span>
                    <strong>{eventTitle(event, lesson)}</strong>
                  </button>
                  {timeline.triggeredEventIds.has(event.id) ? (
                    <Badge tone="success">Đã qua</Badge>
                  ) : null}
                </li>
              ))}
            </ol>
            <p className="sr-announcement" aria-live="polite">
              {announcement}
            </p>
          </Card>

          <section className="activity-stack" aria-label="Hoạt động bài học">
            {lesson.activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                active={activity.id === activeActivityId}
                answered={answeredQuizIds.has(activity.id)}
                selectedOption={selectedOptions[activity.id]}
                onSelectOption={(optionId) =>
                  setSelectedOptions((current) => ({ ...current, [activity.id]: optionId }))
                }
                onSubmit={() => submitQuiz(activity.id)}
              />
            ))}
          </section>
        </main>

        <aside className="lesson-aside" aria-label="Tiến độ bài học">
          <Card>
            <div className="lesson-section-heading">
              <div>
                <span className="eyebrow">Checklist</span>
                <h2>Bằng chứng học tập</h2>
              </div>
              <Badge tone="info">
                {selfChecklist.size}/{lesson.checklist.length}
              </Badge>
            </div>
            <ul className="checklist lesson-checklist">
              {lesson.checklist.map((item) => {
                const canSelfConfirm = item.evidence === 'self';
                const checked = canSelfConfirm
                  ? selfChecklist.has(item.id)
                  : Boolean(item.activityId && answeredQuizIds.has(item.activityId));
                return (
                  <li key={item.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!canSelfConfirm}
                        onChange={() => toggleSelfChecklist(item.id)}
                      />
                      <span>
                        <strong>{item.text}</strong>
                        <small>
                          {item.evidence === 'self'
                            ? 'Tự xác nhận'
                            : item.evidence === 'system'
                              ? 'Hệ thống xác nhận khi activity hoàn tất'
                              : 'Cần giáo viên review'}
                        </small>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <span className="eyebrow">Trạng thái</span>
            <h2>Chưa lưu đồng bộ</h2>
            <p className="muted-copy">
              Refresh trang sẽ reset trạng thái trong Slice 2. Save/resume thật thuộc Slice 5.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ActivityCard({
  activity,
  active,
  answered,
  selectedOption,
  onSelectOption,
  onSubmit,
}: {
  activity: StudentLessonActivity;
  active: boolean;
  answered: boolean;
  selectedOption: string | undefined;
  onSelectOption: (optionId: string) => void;
  onSubmit: () => void;
}) {
  if (activity.type !== 'quiz') {
    return (
      <Card className={active ? 'activity-card activity-card-active' : 'activity-card'}>
        <div className="lesson-section-heading">
          <div>
            <span className="eyebrow">Practice</span>
            <h2>{activity.type === 'quick-code' ? 'Quick Code' : 'Local Project'}</h2>
          </div>
          <Badge tone="warning">Slice 3–5</Badge>
        </div>
        <p>
          {activity.type === 'quick-code'
            ? 'Runtime trình duyệt chưa bật trong Slice 2; không hiển thị output giả.'
            : 'Project này sẽ tải starter ZIP để thực hành trên máy cá nhân.'}
        </p>
      </Card>
    );
  }
  return (
    <Card className={active ? 'activity-card activity-card-active' : 'activity-card'}>
      <div className="lesson-section-heading">
        <div>
          <span className="eyebrow">Checkpoint quiz</span>
          <h2>Kiểm tra nhanh</h2>
        </div>
        <Badge tone={answered ? 'success' : 'info'}>
          {answered ? 'Đã trả lời' : 'Chưa trả lời'}
        </Badge>
      </div>
      <fieldset className="quiz-fieldset">
        <legend>{activity.question}</legend>
        {activity.options.map((option) => (
          <label className="quiz-option" key={option.id}>
            <input
              type="radio"
              name={`quiz-${activity.id}`}
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => onSelectOption(option.id)}
            />
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      <button
        className="button button-primary"
        type="button"
        disabled={!selectedOption}
        onClick={onSubmit}
      >
        Ghi nhận câu trả lời
      </button>
      {answered ? (
        <p className="formative-note">Đã ghi nhận formative, chưa phải điểm chính thức.</p>
      ) : null}
    </Card>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remainder}`;
}

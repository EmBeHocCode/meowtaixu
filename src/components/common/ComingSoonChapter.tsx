type ComingSoonChapterProps = {
  id: string;
  headingId: string;
  index: string;
  title: string;
};

export function ComingSoonChapter({ id, headingId, index, title }: ComingSoonChapterProps) {
  return <section id={id} className="journey-placeholder" aria-labelledby={headingId}>
    <p className="journey-placeholder__label"><span aria-hidden="true">{index} / </span>{title}</p>
    <h2 id={headingId}>
      <span className="sr-only">{title}: </span>
      <span lang="en">Coming soon</span>
      <span className="journey-placeholder__separator" aria-hidden="true">/</span>
      <span lang="zh-Hans">即将推出</span>
    </h2>
  </section>;
}

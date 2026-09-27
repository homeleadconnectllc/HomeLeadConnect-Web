type Props = {
  eyebrow: string;
  title: string;
  body?: string;
};

/** A shared public story transition; operational records and forms stay separate. */
export default function PublicEditorialIntro({ eyebrow, title, body }: Props) {
  return <div className="hcx-editorial-intro">
    <p className="hcx-editorial-eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    {body && <p>{body}</p>}
  </div>;
}

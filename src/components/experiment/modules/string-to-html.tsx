import classNames from 'classnames';

interface StringHTMLProps {
    htmlString: string;
    margin?: boolean;
}

export default function StringHTML({ htmlString, margin = true }: StringHTMLProps) {
    return (
        <div
            className={classNames(
                'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none',
                {
                    'm-5': margin,
                }
            )}
            dangerouslySetInnerHTML={{ __html: htmlString }}
        />
    );
}

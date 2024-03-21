export default function StringHTML({ htmlString }: { htmlString: string }) {
    return (
        <div
            className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none"
            dangerouslySetInnerHTML={{ __html: htmlString }}
        />
    );
}

function convertToParagraphs(text: string): string[] {
    // 分割字符串为段落
    const paragraphs = text.split(/\r\n|\r|\n/);

    return paragraphs;
}

export { convertToParagraphs };

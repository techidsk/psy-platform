import { ExperimentIntro } from "./experiment-intro";

interface ExperimentStarterProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
}

export function ExperimentStarter({
    title,
    children
}: ExperimentStarterProps) {


    return <div className="flex flex-col gap-4">
        <ExperimentIntro title={title} >
            <p className="py-2 text-justify">
                欢迎参加我们的心理测验。在这个测验中，您将被要求在我们的文本框内畅所欲言，分享您的想法和感受。您可以使用回车或者句号做为结尾，我们会为您生成一张图片。请注意，您不需要等待图片的生成，可以尽情输入，直到您感觉已经表达了您的内心世界。
            </p>
            <p className="py-2 text-justify">
                在这个测验中，我们希望了解您的情感、想法和行为。您的回答将被用于研究和分析，以帮助我们更好地了解人类心理。请放心地表达您的内心世界，我们会认真听取并理解您的每一个诉求。
            </p>
            <p className="py-2 text-justify">
                当您输入完毕后，点击完成即可完成测验。请注意，您的个人信息和数据将被严格保密，只有研究团队成员才能访问它们。如果您有任何疑问或意见，请随时与我们联系。感谢您的参与！
            </p>
        </ExperimentIntro>
        <div className="flex justify-center">
            {/* 实验开始button */}
            {children}
        </div>
    </div>
}
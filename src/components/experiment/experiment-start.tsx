import { ExperimentIntro } from "./experiment-intro";

interface ExperimentStartProps extends React.HTMLAttributes<HTMLDivElement> {

}

export function ExperimentStart({
    children
}: ExperimentStartProps) {



    return <div className="flex flex-col gap-4">
        <ExperimentIntro />
        <div className="flex justify-end">
            {children}
        </div>
    </div>
}
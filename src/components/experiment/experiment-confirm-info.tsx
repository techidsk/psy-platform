'use client';
import { usePreExperimentState } from '@/state/_pre_atoms';
interface ExperimentConfirmProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ExperimentConfirmInfo({}: ExperimentConfirmProps) {
    const selectedEngine = usePreExperimentState((state) => state.engine);

    return (
        <div className="flex gap-8 justify-center items-center w-96">
            {selectedEngine?.id ? (
                <>
                    <div className="text-xl font-bold">您选择的风格</div>
                    <img
                        className="image-holder basis-1/2"
                        style={{ maxWidth: 96 }}
                        src={selectedEngine.engine_image}
                        alt=""
                        width={96}
                        height={96}
                    />
                </>
            ) : (
                <div className="text-2xl font-bold text-gray-700">请选择</div>
            )}
        </div>
    );
}

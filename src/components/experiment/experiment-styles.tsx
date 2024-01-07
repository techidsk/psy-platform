'use client';
import { EngineStyle } from '@/types/engine';
import Image from 'next/image';
import { usePreExperimentState } from '@/state/_pre_atoms';
interface ExperimentStylesProps {
    engines: EngineStyle[];
}

/**
 * 选择引擎样式
 */
export function ExperimentStyles({ engines }: ExperimentStylesProps) {
    const selectedEngine = usePreExperimentState((state) => state.engine);
    const setEngine = usePreExperimentState((state) => state.setEngine);

    return (
        <div className="columns-3 gap-4 md:gap-8">
            {engines.map((engine) => {
                return (
                    <div className="flex flex-col gap-8 items-center" key={engine.id}>
                        <Image
                            className={`image-holder cursor-pointer ${
                                selectedEngine.id === engine.id
                                    ? 'border-2 border-solid border-blue-300'
                                    : ''
                            }`}
                            src={engine.engine_image}
                            alt={engine.engine_description || engine.engine_name}
                            width={512}
                            height={512}
                            onClick={() => setEngine(engine)}
                        />
                    </div>
                );
            })}
        </div>
    );
}

import { afterEach, expect, it, vi } from 'vitest';
import { ExperimentEditor } from '@/components/experiment/experiment-editor';

const mocks = vi.hoisted(() => ({ set: vi.fn() }));
vi.mock('react', async (original) => ({
    ...(await original<typeof import('react')>()),
    useState: (initial: unknown) => [initial, mocks.set],
    useEffect: vi.fn(),
    useRef: (initial: unknown) => ({ current: initial }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/components/ui/modal', () => ({ Modal: vi.fn() }));
vi.mock('@/components/icons', () => ({ Icons: {} }));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
afterEach(() => vi.unstubAllGlobals());

it('空输入、输入法确认和长按回车均不锁定；随后正常回车只提交一次', () => {
    const send = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', send);
    const editor = ExperimentEditor({ nanoId: 'exp', part: 1, experimentImageList: [] });
    const input = editor.props.children.find(
        (child: { type?: string } | null) => child?.type === 'textarea'
    ).props;
    const enter = (nativeEvent = {}, repeat = false) =>
        input.onKeyDown({
            key: 'Enter',
            nativeEvent,
            repeat,
            preventDefault: vi.fn(),
        });
    input.ref.current = { value: '   ' };
    enter();
    input.ref.current.value = '测试输入内容';
    enter({ isComposing: true });
    enter({ keyCode: 229 });
    enter({}, true);
    expect(mocks.set).not.toHaveBeenCalledWith(true);
    expect(send).not.toHaveBeenCalled();
    enter();
    enter();
    expect(send).toHaveBeenCalledOnce();
    expect(mocks.set).toHaveBeenCalledWith(true);
});
